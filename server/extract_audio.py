import moviepy.editor as mp
import librosa
import noisereduce as nr
import numpy as np
import logging

def func(email, logger):
    try:
        my_clip = mp.VideoFileClip(r"./video_" + email + ".mp4")
        my_clip.audio.write_audiofile(r"resulted_audio.mp3")
        data = []
        audio_data, sr = librosa.load("./resulted_audio.mp3")
        reduced_audio_data = nr.reduce_noise(y=audio_data, sr=sr)
        mfcc = librosa.feature.mfcc(y=reduced_audio_data, sr=sr, n_mfcc=128,n_fft = 512, hop_length = 212, win_length = 100)
        data.append(mfcc)
        # print(len(data), len(data[0]))

        desired_length = 20000
        modified_data = []
        for mfcc in data:
            # Determine the current sequence length
            current_length = mfcc.shape[1]

            # Pad or truncate to the desired sequence length
            if current_length < desired_length:
                # Pad with zeros to the right (end of sequence)
                padding = np.zeros((mfcc.shape[0], desired_length - current_length))
                modified_mfcc = np.hstack((mfcc, padding))
            else:
                # Truncate to the desired sequence length
                modified_mfcc = mfcc[:, :desired_length]

            # Append the modified MFCC features to the list
            modified_data.append(modified_mfcc)

        print(len(modified_data), len(modified_data[0]), len(modified_data[0][0]))
        return modified_data, 200, 'audio data generated successfully'
    except:
        logger.debug('failed to generate audio data')
        return None, 500, 'failed to generate audio data'

def get_audio_data(email, logger: logging.Logger):
    modified_data, code, msg = func(email, logger)
    return modified_data, code, msg