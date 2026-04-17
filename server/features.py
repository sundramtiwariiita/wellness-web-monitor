import logging
import os
import re
import tempfile

import cv2
import librosa
import numpy as np
from moviepy.editor import VideoFileClip

from text import create_transcript


NEGATIVE_TERMS = {
    "alone", "angry", "anxious", "ashamed", "bad", "burden", "crying", "down",
    "drained", "empty", "fear", "guilty", "hard", "hopeless", "hurt", "lonely",
    "lost", "numb", "overwhelmed", "sad", "scared", "shame", "stressed", "tired",
    "upset", "worthless",
}

POSITIVE_TERMS = {
    "better", "calm", "fine", "good", "grateful", "great", "happy", "hopeful",
    "okay", "peaceful", "positive", "relaxed", "safe", "smile", "strong", "well",
}


def clamp_score(value):
    return float(np.clip(value, 0.05, 0.95))


def score_text_signal(email, logger: logging.Logger):
    transcript_path = f'./transcription_{email}.txt'
    code, _ = create_transcript(email, logger)
    if code != 200 or not os.path.exists(transcript_path):
        logger.debug('transcript unavailable, using neutral text score')
        return 0.5

    with open(transcript_path, 'r', encoding='utf-8', errors='ignore') as transcript_file:
        content = transcript_file.read().strip().lower()

    if not content:
        logger.debug('transcript empty, using neutral text score')
        return 0.5

    tokens = re.findall(r"[a-z']+", content)
    negative_hits = sum(token in NEGATIVE_TERMS for token in tokens)
    positive_hits = sum(token in POSITIVE_TERMS for token in tokens)

    score = 0.5 + min(negative_hits * 0.08, 0.28) - min(positive_hits * 0.06, 0.18)
    logger.debug('text score=%s negative_hits=%s positive_hits=%s', score, negative_hits, positive_hits)
    return clamp_score(score)


def score_audio_signal(video_path, logger: logging.Logger):
    temp_audio_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_audio:
            temp_audio_path = temp_audio.name

        with VideoFileClip(video_path) as clip:
            if clip.audio is None:
                logger.debug('video has no audio track, using neutral audio score')
                return 0.5
            clip.audio.write_audiofile(temp_audio_path, codec='pcm_s16le', verbose=False, logger=None)

        audio_data, sample_rate = librosa.load(temp_audio_path, sr=16000)
        if audio_data.size == 0:
            logger.debug('audio extraction produced no samples, using neutral audio score')
            return 0.5

        rms = librosa.feature.rms(y=audio_data)[0]
        pitch = librosa.yin(audio_data, fmin=75, fmax=350)
        finite_pitch = pitch[np.isfinite(pitch)]

        rms_mean = float(np.mean(rms))
        rms_std = float(np.std(rms))
        pitch_std = float(np.std(finite_pitch) / (np.mean(finite_pitch) + 1e-6)) if finite_pitch.size else 0.0

        score = 0.42
        if rms_mean < 0.035:
            score += 0.12
        if rms_std < 0.025:
            score += 0.10
        if pitch_std < 0.16:
            score += 0.12

        logger.debug(
            'audio score=%s rms_mean=%s rms_std=%s pitch_std=%s',
            score,
            rms_mean,
            rms_std,
            pitch_std,
        )
        return clamp_score(score)
    except Exception as exc:
        logger.debug('audio scoring failed: %s', exc)
        return 0.5
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


def score_visual_signal(video_path, logger: logging.Logger):
    try:
        capture = cv2.VideoCapture(video_path)
        previous_frame = None
        motion_values = []
        frame_index = 0

        while capture.isOpened():
            success, frame = capture.read()
            if not success:
                break

            if frame_index % 5 != 0:
                frame_index += 1
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            if previous_frame is not None:
                difference = cv2.absdiff(previous_frame, gray)
                motion_values.append(float(np.mean(difference)) / 255.0)
            previous_frame = gray
            frame_index += 1

        capture.release()

        if not motion_values:
            logger.debug('no visual motion samples collected, using neutral visual score')
            return 0.5

        average_motion = float(np.mean(motion_values))
        score = 0.58 - min(average_motion * 3.2, 0.28)
        logger.debug('visual score=%s average_motion=%s', score, average_motion)
        return clamp_score(score)
    except Exception as exc:
        logger.debug('visual scoring failed: %s', exc)
        return 0.5


def get_final_results(email, logger: logging.Logger):
    video_path = f'./video_{email}.mp4'
    if not os.path.exists(video_path):
        logger.debug('video file not found for scoring')
        return None, 500, 'video file not found'

    text_score = score_text_signal(email, logger)
    audio_score = score_audio_signal(video_path, logger)
    visual_score = score_visual_signal(video_path, logger)

    combined_score = clamp_score((0.4 * audio_score) + (0.35 * visual_score) + (0.25 * text_score))
    logger.debug(
        'final score=%s from text=%s audio=%s visual=%s',
        combined_score,
        text_score,
        audio_score,
        visual_score,
    )

    return np.array([[combined_score]], dtype=np.float32), 200, 'Results generated successfully'
