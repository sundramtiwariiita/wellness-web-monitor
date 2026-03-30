from transformers import RobertaTokenizer, RobertaForSequenceClassification
import torch


def get_emotion(message):
    # Load the tokenizer and model
    tokenizer = RobertaTokenizer.from_pretrained('./roberta_bert_model/roberta_tokenizer')  # Assuming you saved the tokenizer with this name
    model = RobertaForSequenceClassification.from_pretrained('./roberta_bert_model/roberta_sentiment_model_7_classes')  # Load the trained model

    # New sentence for prediction
    # while (True):
    new_sentence=message
    
    
    # Tokenize the new sentence
    tokens = tokenizer.encode_plus(
        new_sentence,
        add_special_tokens=True,
        max_length=200,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt'
    )

    # Modify attention mask to emphasize tokens after "not"
    not_indices = [i for i, token in enumerate(tokens['input_ids'][0]) if token == tokenizer.convert_tokens_to_ids("not")]
    if not_indices:
        for i in not_indices:
            # Make the token after "not" have higher attention
            tokens['attention_mask'][0][i + 1] = 2

    # Get the input tensors
    input_ids = tokens['input_ids']
    attention_mask = tokens['attention_mask']

    # Make prediction
    with torch.no_grad():
        model.eval()
        inputs = {'input_ids': input_ids, 'attention_mask': attention_mask}
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=1).item()

    # Interpret the output
    label_mapping_reverse = {0: 'anger', 1: 'joy', 2: 'fear', 3: 'sadness', 4: 'disgust', 5: 'shame', 6: 'guilt'}
    predicted_emotion = label_mapping_reverse[predicted_class]

    # print(f"The predicted emotion for the sentence '{new_sentence}' is: {predicted_emotion}")
    return predicted_emotion