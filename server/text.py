from moviepy.video.io.VideoFileClip import VideoFileClip
import speech_recognition as sr
import os
import logging

def extract_text_from_video(email, video_path, logger: logging.Logger, output_text_file, segment_duration=60):
    try:
        video = VideoFileClip(video_path) 
        total_duration = int(video.duration)

        r = sr.Recognizer()
        if os.path.exists(output_text_file):
            os.remove(output_text_file)

        with open (output_text_file, 'x') as f:
            pass
        logger.debug("transcription file created") 

        # Loop through the video in segments and transcribe the audio
        for i in range(0, total_duration, segment_duration):
            start_time = i
            end_time = min(i + segment_duration, total_duration)

            # Extract audio from the video segment
            audio = video.audio.subclip(start_time, end_time)
            logger.debug('audio extracted from video file')

            temp_audio_file = f"temp_audio_{start_time}_{end_time}_{email}.wav"
            audio.write_audiofile(temp_audio_file, codec='pcm_s16le')
            logger.debug('temp audio file saved')


            # Transcribe the audio segment
            with sr.AudioFile(temp_audio_file) as source:
                audio_data = r.record(source)
                try:                   
                    text = r.recognize_google(audio_data, show_all=False)
                    logger.debug("text extracted...google API working")

                    with open(output_text_file, "a") as f:
                            f.write(text + "\n")
                    logger.debug("transcription file completed")
                    
                except sr.UnknownValueError:
                    logger.debug(f"Google Speech Recognition could not understand audio in segment {i}-{i+segment_duration}")
                    print(f"Google Speech Recognition could not understand audio in segment {i}-{i+segment_duration}")
                except sr.RequestError as e:
                    logger.debug(f"Google Speech Recognition could not understand audio in segment {i}-{i+segment_duration}")
                    print(f"Could not request results from Google Speech Recognition service; {e}")

            if os.path.exists(temp_audio_file):
                os.remove(temp_audio_file)

        video.close()
        logger.debug('Successfully extraced text from video file')
        return 200, 'Successfully extraced text from video file'

    except Exception as e:
        logger.debug('Failed to extract text from video file')
        return 500, 'Failed to extract text from video file'

def create_transcript(email, logger: logging.Logger): 
    video_path = './video_' + email + '.mp4'
    output_text_file = './transcription_' + email + '.txt'
    code, message  = extract_text_from_video(email, video_path, logger, output_text_file)
    return code, message
