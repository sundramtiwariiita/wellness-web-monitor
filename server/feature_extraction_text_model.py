from transformers import BertTokenizer, BertForSequenceClassification, BertModel
import torch
import pandas as pd
import numpy as np
import tensorflow as tf
import logging

def func(email, logger: logging.Logger):
    try : 
        model_dir = "./fine_tuned_bert_model"  
        tokenizer = BertTokenizer.from_pretrained(model_dir)
        model = BertModel.from_pretrained(model_dir)

        content = pd.read_csv('./transcription_' + email +'.txt', header=None)

        data = []
        data.append(content[0].to_list())
        # print(data)

        encoded_data = tokenizer(data[0], padding=True, truncation=True, return_tensors="pt")
        # print(encoded_data)

        with torch.no_grad():
            model.eval()
            features = model(**encoded_data).last_hidden_state

        # Convert features to NumPy arrays
        features3 = features.numpy()

        print(features3.shape)

        def pad_array_with_mean(original_array, target_shape):
            num_rows_needed = target_shape[0]

            statistics = np.mean(original_array, axis=0)
            if original_array.shape[0] < num_rows_needed:
                pad_rows = num_rows_needed - original_array.shape[0]
                padded_array = np.tile(statistics, (pad_rows, 1))
                padded_array = np.concatenate((original_array, padded_array), axis=0)
            else:
                padded_array = original_array[:num_rows_needed, :]

            return padded_array

        data = pad_array_with_mean(features3[0],(512,768))
        data1 = []
        data1.append(data)

        X3_tensor = tf.convert_to_tensor(np.array(data1), dtype=tf.float32)
        return X3_tensor, 200, 'Successfully extracted features from text file'
    
    except Exception as e:
        logger.debug('Failed to extract features from text file')
        return None, 500, 'Failed to extract features from text file'

def get_text_features(email, logger: logging.Logger):
    X3_tensor, code, message = func(email, logger)
    return X3_tensor, code, message