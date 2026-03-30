import numpy as np
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import load_model
from facial import (
    get_facial_features
)
from pose_feature_extraction import (
    get_pose_data
)
from extract_audio import (
    get_audio_data
)
from text import (
    create_transcript
)
from feature_extraction_text_model import (
    get_text_features
)
import logging

def make_rows_equal(array1, array2):
    rows1 = len(array1)
    rows2 = len(array2)

    if rows1 > rows2:
        array1 = array1[:rows2]
    elif rows2 > rows1:
        array2 = array2[:rows1]

    return array1, array2

def video_func(email, logger: logging.Logger):
    facial_features, code, msg = get_facial_features(email, logger)
    if code == 500:
        logger.debug(msg)
        return None, code, msg

    pose_data, code, msg = get_pose_data(email, logger)
    if code == 500:
        logger.debug(msg)
        return None, code, msg

    features, pose = make_rows_equal(facial_features, pose_data)
    
    scaler = StandardScaler()
    features = scaler.fit_transform(features)
    pose = scaler.fit_transform(pose)

    vid_features = np.concatenate((features, pose), axis=1)
    loaded_feature_extraction_video_model = load_model('./codes/feature_extraction_video_model.h5',compile=False)

    original_array = vid_features

    # Target shape (8000, 142)
    target_shape = (8000, 142)
    
    # Calculate the ratio of new rows to existing rows
    row_ratio = target_shape[0] / original_array.shape[0]

    # Use numpy's `numpy.repeat` to repeat rows
    resized_array = np.repeat(original_array, int(np.ceil(row_ratio)), axis=0)[:target_shape[0]]
    # print(resized_array.shape)
    resized_video_array = resized_array.reshape((1,8000,142))
    # print(resized_video_array.shape)
    
    video_features = loaded_feature_extraction_video_model.predict(resized_video_array)
    # print(video_features.shape)
    return video_features, 200, 'video_features generated successfully'

def audio_func(email, logger: logging.Logger):
    
    audio_data, code, msg = get_audio_data(email,logger)
    if code == 500:
        logger.debug(msg)
        return None, code , msg
    
    loaded_feature_extraction_audio_model = load_model("./codes/feature_extraction_audio_model.h5", compile=False)

    audio_data = np.array(audio_data)
    resized_audio_array = audio_data.reshape((1, audio_data.shape[1], audio_data.shape[2]))
    # print(resized_audio_array.shape)
    audio_features = loaded_feature_extraction_audio_model.predict(resized_audio_array)
    # print(audio_data)
    # print(audio_features.shape)
    # print(audio_features)
    return audio_features, 200, 'audio_features generated successfully'

def get_audio_and_video_features(email, logger: logging.Logger):
    video_features, code, msg = video_func(email, logger)
    if code == 500:
        logger.debug(msg)
        return None, None, code, msg

    audio_features, code, msg = audio_func(email, logger)
    if code == 500:
        logger.debug(msg)
        return None, None, code, msg

    return audio_features, video_features, 200, 'audio, video features generated successfully'

def audio_video_fusion(video_features, audio_features, logger: logging.Logger):
    try:
        loaded_audio_video_fusion_model = load_model("./codes/feature_extraction_audio_video_fuse_model.h5", compile=False)
        audio_video_fuse_features = loaded_audio_video_fusion_model.predict([audio_features, video_features])
        print(audio_video_fuse_features.shape)
        print(audio_video_fuse_features)
        return audio_video_fuse_features, 200, 'audio_video_fusion_features generated successfully'
    except:
        logger.debug('failed to generate audio_video_fusion_features')
        return None, 500, 'failed to generate audio_video_fusion_features'

def get_audio_video_fuse_features(email, logger: logging.Logger):
    audio_features, video_features, code, msg = get_audio_and_video_features(email, logger)
    if code == 500:
        logger.debug(msg)
        return None, code, msg
    
    audio_video_fuse_features, code, msg = audio_video_fusion(video_features, audio_features, logger)
    if code == 500:
        logger.debug(msg)
        return None, code, msg
    return audio_video_fuse_features, code, msg

def text_func(email, logger: logging.Logger):
    code, message = create_transcript(email, logger)
    if code == 500:
        logger.debug(message)
        return None, code, message
    
    loaded_text_model = load_model("./new_text_feature_mod.h5", compile=False)

    text_features, code, message = get_text_features(email, logger)
    if code == 500:
        logger.debug(message)
        return None, code, message
    print(text_features)

    try:
        predicted_values = loaded_text_model.predict(text_features)
        print(predicted_values)
        print(predicted_values.shape)
        return predicted_values, 200, 'Successfully predicted values'
    except Exception as e:
        logger.debug('Failed to predict values')
        return None, 500, 'Failed to predict values'

def get_final_results(email, logger: logging.Logger):
    
    text_features, code, message = text_func(email, logger)
    if code == 500:
        logger.debug(message)
        return None, code, message

    audio_video_fuse_features, code, msg = get_audio_video_fuse_features(email, logger)
    if code == 500:
        logger.debug(msg)
        return None, code, msg
    
    loaded_final_model = load_model("./codes/fusion_model.h5")
    result = loaded_final_model.predict([audio_video_fuse_features, text_features])
    print(result)
    return result, 200, 'Results generated successfully'

###############################################
# calling functions
# result = get_final_results(text_features, audio_video_fuse_features)
