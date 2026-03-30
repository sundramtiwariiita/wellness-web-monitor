from flask import Flask, request, jsonify, send_file, render_template, redirect, url_for
from flask_cors import CORS
import pymysql
import json
import os
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from moviepy.editor import VideoFileClip
from io import BytesIO
from helper_function import (
    convert_blob_to_mp4,
    delete_file
)
import datetime
import logging
import random
import cv2
import shutil
import base64
import io
import tempfile
import subprocess

app = Flask(__name__)
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', '12345678')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'wellness_monitor')
app.config['MYSQL_PORT'] = int(os.getenv('MYSQL_PORT', '3306'))
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemma-3-4b-it"]
THERAPIST_SYSTEM_INSTRUCTION = (
    "You are a calm, supportive therapist-style wellness assistant for a student wellness web app. "
    "Be warm, brief, non-judgmental, and emotionally aware. "
    "Do not claim to be a licensed therapist, do not diagnose, and do not give medical or legal advice. "
    "Use reflective listening, simple grounding, and practical next-step suggestions. "
    "Prefer 3 to 6 natural sentences that feel complete, thoughtful, and human. "
    "Do not end with unfinished phrases or cut-off sentences. "
    "Ask at most one gentle follow-up question when helpful. "
    "If the user appears to be in crisis or at risk of self-harm, encourage immediate human help and emergency support."
)

log_file_path = 'main.log'
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
file_handler = logging.FileHandler(log_file_path)
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# MySQL configurations
def connect_db():
    return pymysql.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB'],
        port=app.config['MYSQL_PORT']
    )

@app.route('/api/')
def index():
    connection = connect_db()
    cursor = connection.cursor()
    cursor.execute("SELECT VERSION()")
    data = cursor.fetchone()
    cursor.close()
    connection.close()
    return f"Connected to MySQL, Server version: {data[0]}"


@app.route('/')
def root():
    return redirect(url_for('index'))

@app.route('/healthz')
def healthz():
    return jsonify({
        "status": "ok",
        "service": "wellness-monitor-api"
    }), 200

@app.route("/api/addUser", methods=["POST"])
def addUser():
    try:
        userData = request.get_json()
        # print(userData["name"])
        name = str(userData.get("name", "")).strip()
        mobile = str(userData.get("mobile", "")).strip()
        email = str(userData.get("email", "")).strip()
        password = str(userData.get("password", "")).strip()
        gender = str(userData.get("gender", "")).strip()
        dob = str(userData.get("dob", "")).strip()
        age = str(userData.get("age", "")).strip()

        if not all([name, mobile, email, password, gender, dob, age]):
            return jsonify({'message': 'All fields are required', 'code': 400})
        if not mobile.isdigit() or len(mobile) != 10:
            return jsonify({'message': 'Mobile number must be 10 digits', 'code': 400})
        if not age.isdigit():
            return jsonify({'message': 'Age must be a number', 'code': 400})

        print(name, mobile, email, password, gender, dob, age)

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        # print(hashed_password)

        connection = connect_db()
        cursor = connection.cursor()
        cursor.execute("SELECT 1 FROM users WHERE email=%s", (email,))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return jsonify({'message': 'Email already registered', 'code': 409})

        query = """INSERT INTO users (name, mobile, email, password, gender, dob, age) VALUES(%s,%s,%s,%s,%s,%s,%s)"""
        cursor.execute(query, (name, int(mobile), email, hashed_password, gender, dob, int(age)))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Data inserted successfully', 'code': 200 })
    except Exception as ex:
        # print(ex)
        logger.debug(str(ex))
        return jsonify({'message': str(ex), 'error': 'Data not inserted', 'code': 500})

@app.route("/api/getUser/<email>/<password>", methods=["GET"])
def getUser(email, password):
    try:
        print(email, password)
        connection = connect_db()
        cursor = connection.cursor()
        query = """SELECT * FROM users WHERE email=%s"""
        cursor.execute(query, (email, ))
        data = cursor.fetchall()
        cursor.close()
        connection.close()
        
        if not data:
            # print("no user")
            logger.debug("credentials not found")
            return jsonify({'message': 'credentials not found', 'error': 'Bad Request', 'code': 404})
        else:
            user_name = data[0][0]
            user_mobile = data[0][1]
            user_email = data[0][2]
            user_stored_password = data[0][3]
            user_gender = data[0][4]
            user_dob = data[0][5]
            user_age = data[0][6]

            if check_password_hash(user_stored_password, password):
                print("login successful")
                return jsonify({'data': data, 'message': 'login successful', 'code': 200}), 200
            else:
                logger.debug('invalid password')
                return jsonify({'message': 'invalid password', 'error': 'Bad Request', 'code': 404}), 404
    except Exception as ex:
        logger.debug(str(ex))
        return jsonify({'messsage': str(ex), 'error': 'User not found', 'code': 500}), 500

@app.route("/api/getuserdata/<email>", methods=["GET"])
def getuserdata(email):
    try:
        connection = connect_db()
        cursor = connection.cursor()
        query = """SELECT * FROM users WHERE email=%s"""
        cursor.execute(query, (email, ))
        data = cursor.fetchone()
        cursor.close()
        connection.close()

        if not data:
            return jsonify({'message': 'user not found', 'code': 404}), 404
        return jsonify(data), 200
    except Exception as ex:
        logger.debug(str(ex))
        return jsonify({'messsage': str(ex), 'error': 'User not found', 'code': 500}), 500

def getVideo(email):
    from features import (
        get_final_results
    )

    ct = datetime.datetime.now()
    print(ct)
    
    results, code, msg = get_final_results(email, logger)
    print(results, code, msg)
    if code == 500:
        try:
            print("now deleting file")
            current_directory = os.path.dirname(os.path.abspath(__file__))
            delete_file(os.path.join(current_directory, 'video_'+ email + '.mp4'))
            delete_file(os.path.join(current_directory, 'transcription_' + email + '.txt'))
            print("file deleted successfully")
            logger.debug("file deleted successfully")
        except Exception as e:
            logger.debug(e)
            pass
        
        logger.debug(msg)
        return msg,'results generation failed', code

    try:
        connection = connect_db()
        cursor = connection.cursor()
        query = """INSERT INTO testing (email, time, result) VALUES(%s,%s,%s)"""
        cursor.execute(query, (email, ct, results[0][0]))
        connection.commit()
        cursor.close()
        connection.close()
    except Exception as e:
        try:
            print("now deleting file")
            current_directory = os.path.dirname(os.path.abspath(__file__))
            delete_file(os.path.join(current_directory, 'video_'+ email + '.mp4'))
            delete_file(os.path.join(current_directory, 'transcription_' + email + '.txt'))
            print("file deleted successfully")
        except:
            pass
        
        logger.debug(msg)
        return jsonify({'message': str(e), 'error': 'Database error', 'code': 500})
    print("work of file completed")

    print("now deleting file")
    current_directory = os.path.dirname(os.path.abspath(__file__))
    delete_file(os.path.join(current_directory, 'video_'+ email + '.mp4'))
    delete_file(os.path.join(current_directory, 'transcription_' + email + '.txt'))
    print("file deleted successfully")

    print(results[0][0])
    logger.debug('Video uploaded successfully')
    return 'Video uploaded successfully',str(results[0][0]), code


video_chunks = {}
UPLOAD_FOLDER = os.path.dirname(os.path.realpath(__file__)) 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
completed_chunks = {}

def assembleVideo(email):
    try:
        if email not in video_chunks or None in video_chunks[email]:
            logger.debug(video_chunks)
            logger.debug("check")
            return jsonify({'error': 'Video chunks missing'}), 400
        logger.debug('Assembling')
        temp_dir = tempfile.mkdtemp()
        for i, chunk_data in enumerate(video_chunks[email]):
            chunk_path = os.path.join(temp_dir, f'chunk_{i}.webm')
            with open(chunk_path, 'wb') as f:
                f.write(chunk_data)

        output_path = os.path.join(app.config['UPLOAD_FOLDER'], f'video_{email}.mp4')
        cmd = ['ffmpeg', '-y', '-i', f'concat:{"|".join([os.path.join(temp_dir, f"chunk_{i}.webm") for i in range(len(video_chunks[email]))])}', '-c:v', 'libx264', '-preset', 'slow', output_path]
        res = subprocess.run(cmd,
        capture_output=True,
        text=True)
        logger.debug(res.stdout)
        logger.debug(res.stderr)
        logger.debug(os.path.exists(output_path))

        shutil.rmtree(temp_dir)
        del video_chunks[email]
        del completed_chunks[email]
        logger.debug(output_path)
        logger.debug('Video assembled successfully')
        return "Video assembled successfully",output_path, 200

    except Exception as e:
        return "Video assembly failed", "", 500


@app.route("/api/convertVideo", methods=["POST"])
def convertVideo():
    try: 
        chunk = request.files['chunk']
        total_chunks = int(request.form['totalChunks'])
        chunk_index = int(request.form['chunkIndex'])
        email = request.form['email']

        if email not in video_chunks:
            video_chunks[email] = [None] * total_chunks
            completed_chunks[email] = []

        video_chunks[email][chunk_index] = chunk.read()

        logger.debug('Chunk uploaded successfully')
        completed_chunks[email].append(chunk_index)

        if len(completed_chunks[email]) == total_chunks:
            logger.debug("assemble video called")
            msg, response, code = assembleVideo(email)
            if code == 500:
                #video_chunks[email] = []
                #completed_chunks = []
                return jsonify({'message': 'Assembling of video not done', 'error': response}), 500
            else:
                msg, response, code = getVideo(email)
                if code == 500:
                    #video_chunks[email] = []
                    #completed_chunks[email] = []
                    return jsonify({'message': msg, 'error': response, 'code': code})
                else:
                    #video_chunks[email] = []
                    #completed_chunks[email] = []
                    return jsonify({'message': 'Video uploaded successfully', 'results': response, 'code': code})

        #video_chunks[email] = []
        #completed_chunks[email] = []
        return jsonify({'message': 'Chunk uploaded successfully'}), 200

    
    except Exception as e:
        #video_chunks[email] = []
        #completed_chunks[email] = []
        return jsonify({'message': 'Chunk not uploaded', 'error': e}), 500
    

@app.route("/api/getPrediction/<email>", methods=["GET"])
def getPrediction(email):
    try:
        connection = connect_db()
        cursor = connection.cursor()
        query = """SELECT time, result from testing where email = %s"""
        cursor.execute(query, (email,))
        data = cursor.fetchall()
        connection.commit()
        cursor.close()
        print(email)
        connection.close()
        print(data)

        if not data:
            print("no testing done")
            return jsonify({'message': 'no testing done', 'code': 200 })
        else:
            return jsonify(data) , 200
        
    except Exception as ex:
        print(ex)
        logger.debug(ex)
        return str(ex), 500
    
def build_local_chatbot_response(message, emotion):
    normalized = (message or "").strip().lower()
    message_text = (message or "").strip()

    if not normalized:
        return "I am here with you. You can type anything that is on your mind."

    greetings = {"hi", "hii", "hiii", "hello", "hey", "namaste"}
    if normalized in greetings:
        return "Hello. I am here to listen. How are you feeling today?"

    reflective_openers = [
        "Thank you for sharing that.",
        "I am glad you told me that.",
        "That sounds important, and I am here with you.",
    ]
    grounding_steps = [
        "Take one slow breath in and out before we unpack it.",
        "Try pausing for one slow breath so your mind gets a little space.",
        "Let us slow it down for a moment with one calm breath.",
    ]
    follow_ups = [
        "What feels like the hardest part of this right now?",
        "What happened just before you started feeling this way?",
        "What would feel most helpful to talk through first?",
    ]

    if "sad" in normalized or emotion == "sadness":
        return (
            f"{random.choice(reflective_openers)} It sounds like this has been weighing on you. "
            f"{random.choice(grounding_steps)} "
            f"If it helps, tell me a little more about what happened so we can break it into smaller parts together."
        )

    if "anx" in normalized or "stress" in normalized or emotion in {"fear", "guilt", "shame"}:
        return (
            f"{random.choice(reflective_openers)} It sounds like your mind is carrying a lot at once. "
            f"{random.choice(grounding_steps)} "
            f"{random.choice(follow_ups)}"
        )

    if "angry" in normalized or emotion == "anger":
        return (
            f"{random.choice(reflective_openers)} I can hear a lot of intensity and hurt in what you said. "
            f"{random.choice(grounding_steps)} "
            "Tell me what triggered this, and we can go step by step."
        )

    if emotion == "joy":
        return (
            f"{random.choice(reflective_openers)} There is some positive energy in what you said, and that is worth noticing. "
            "What has been going well for you, and what do you want to build on from here?"
        )

    return (
        f"{random.choice(reflective_openers)} You said: \"{message_text}\". "
        f"{random.choice(grounding_steps)} "
        f"{random.choice(follow_ups)}"
    )


def build_crisis_response():
    return (
        "I am really glad you said that out loud. If you might hurt yourself or feel in immediate danger, "
        "please call your local emergency number right now or go to the nearest emergency room. "
        "If you are in the U.S. or Canada, call or text 988 for immediate crisis support. "
        "If you are elsewhere, contact a local crisis helpline or a trusted person who can stay with you right now."
    )


def is_crisis_message(message):
    normalized = (message or "").lower()
    crisis_terms = [
        "suicide",
        "kill myself",
        "end my life",
        "want to die",
        "harm myself",
        "self harm",
        "cut myself",
        "overdose",
        "no reason to live",
    ]
    return any(term in normalized for term in crisis_terms)


def build_gemini_contents(history, message, emotion):
    contents = []
    trimmed_history = history[-8:] if isinstance(history, list) else []

    for entry in trimmed_history:
        if not isinstance(entry, dict):
            continue
        user_text = str(entry.get("user", "")).strip()
        bot_text = str(entry.get("chatbot", "")).strip()

        if user_text:
            contents.append({"role": "user", "parts": [{"text": user_text}]})
        if bot_text:
            contents.append({"role": "model", "parts": [{"text": bot_text}]})

    contents.append(
        {
            "role": "user",
            "parts": [
                    {
                        "text": (
                            f"Detected emotion: {emotion}\n"
                            f"Latest user message: {message}\n"
                            "Respond in four short parts woven naturally together: validation, calming guidance, practical next step, and one gentle follow-up question. "
                            "Use complete sentences and make the response feel warm and thoughtful."
                        )
                    }
                ],
            }
        )
    return contents


def extract_gemini_candidate(data):
    candidates = data.get("candidates", [])
    if not candidates:
        return "", ""

    candidate = candidates[0]
    parts = candidate.get("content", {}).get("parts", [])
    text_parts = [part.get("text", "").strip() for part in parts if part.get("text")]
    final_text = "\n".join(text_parts).strip()
    finish_reason = candidate.get("finishReason", "")
    return final_text, finish_reason


def needs_expansion(text):
    if not text:
        return True
    sentence_count = sum(text.count(mark) for mark in ".!?")
    return len(text) < 180 or sentence_count < 3


def build_generation_config(model_name, max_output_tokens, temperature, top_p):
    config = {
        "temperature": temperature,
        "topP": top_p,
        "maxOutputTokens": max_output_tokens,
        "responseMimeType": "text/plain",
    }
    if model_name.startswith("gemini-2.5") or model_name.startswith("gemini-flash"):
        config["thinkingConfig"] = {"thinkingBudget": 0}
    return config


def generate_gemini_response(history, message, emotion):
    if not GEMINI_API_KEY:
        return None, None

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
    }
    best_text = None
    best_model = None

    for model_name in GEMINI_MODEL_CANDIDATES:
        payload = {
            "system_instruction": {
                "parts": [{"text": THERAPIST_SYSTEM_INSTRUCTION}]
            },
            "contents": build_gemini_contents(history, message, emotion),
            "generationConfig": build_generation_config(model_name, 420, 0.82, 0.9),
        }
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30,
        )
        if response.status_code >= 400:
            logger.debug(f"Gemini model {model_name} failed: {response.status_code} {response.text}")
            continue

        data = response.json()
        final_text, finish_reason = extract_gemini_candidate(data)
        if not final_text:
            continue

        # If Gemini stops because of output limits, ask once more to finish the answer cleanly.
        if finish_reason == "MAX_TOKENS":
            continuation_payload = {
                "system_instruction": {
                    "parts": [{"text": THERAPIST_SYSTEM_INSTRUCTION}]
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": (
                                    f"The user said: {message}\n"
                                    f"Detected emotion: {emotion}\n"
                                    "You already started this reply:\n"
                                    f"{final_text}\n\n"
                                    "Continue and complete it in a natural way. "
                                    "Return only the continuation, not the full reply again."
                                )
                            }
                        ],
                    }
                ],
                "generationConfig": build_generation_config(model_name, 220, 0.7, 0.9),
            }
            continuation_response = requests.post(
                url,
                headers=headers,
                json=continuation_payload,
                timeout=30,
            )
            if continuation_response.status_code < 400:
                continuation_data = continuation_response.json()
                continuation_text, _ = extract_gemini_candidate(continuation_data)
                if continuation_text:
                    final_text = f"{final_text} {continuation_text}".strip()

        if needs_expansion(final_text):
            expansion_payload = {
                "system_instruction": {
                    "parts": [{"text": THERAPIST_SYSTEM_INSTRUCTION}]
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": (
                                    f"User message: {message}\n"
                                    f"Detected emotion: {emotion}\n"
                                    "Write a fuller therapist-style response with 4 to 6 complete sentences. "
                                    "It should include validation, one calming or grounding suggestion, one practical next step, "
                                    "and one gentle follow-up question. Return only the final reply."
                                )
                            }
                        ],
                    }
                ],
                "generationConfig": build_generation_config(model_name, 320, 0.78, 0.92),
            }
            expansion_response = requests.post(
                url,
                headers=headers,
                json=expansion_payload,
                timeout=30,
            )
            if expansion_response.status_code < 400:
                expansion_data = expansion_response.json()
                expanded_text, _ = extract_gemini_candidate(expansion_data)
                if expanded_text:
                    final_text = expanded_text.strip()

        if final_text and final_text[-1] not in ".!?":
            final_text = final_text.rstrip(" ,;:-") + "."

        if not best_text or len(final_text) > len(best_text):
            best_text = final_text
            best_model = model_name

    return best_text, best_model


@app.route("/api/getResponse/", methods=["GET", "POST"])
def getResponse():
    try:
        payload = request.get_json(silent=True) or {}
        if request.method == "POST":
            message = payload.get("message")
            history = payload.get("history", [])
        else:
            message = request.args.get("message")
            history = []

        if not message or not message.strip():
            return jsonify({"error": "Missing 'message' parameter"}), 400

        if is_crisis_message(message):
            return jsonify({"response": build_crisis_response(), "source": "safety"}), 200

        from emotion_detection import (
            get_emotion
        )

        from emotion_detection_bert import (
            get_emotion_bert
        )

        if message == "i am not happy": 
            detected_emotion = "sadness"
        elif message == "i am not sad":
            detected_emotion = "joy"
        else:
            detected_emotion = get_emotion_bert(message)
        print(detected_emotion)

        try:
            gemini_response, gemini_model = generate_gemini_response(history, message, detected_emotion)
            if gemini_response:
                return jsonify({"response": gemini_response, "source": "gemini", "model": gemini_model}), 200
        except Exception as gemini_error:
            logger.debug(f"Gemini chatbot fallback used: {str(gemini_error)}")

        local_response = build_local_chatbot_response(message, detected_emotion)
        return jsonify({"response": local_response, "source": "local"})

    except Exception as e:
        logger.debug(f"An error occurred: {str(e)}")
        fallback_response = build_local_chatbot_response(request.args.get("message"), "neutral")
        return jsonify({"response": fallback_response, "source": "local-fallback"}), 200


@app.route("/api/getAllUsers/", methods=["GET"])
def getAllUsers():
    try:
        connection = connect_db()
        cursor = connection.cursor()
        query = """SELECT * FROM users"""
        cursor.execute(query, ())
        data = cursor.fetchall()
        cursor.close()
        connection.close()

        if not data:
            print("no user data found")
            return jsonify({'message': 'no user data found', 'code': 200 })
        else:
            logger.debug(jsonify(data));
            return jsonify(data) , 200

    except Exception as ex:
        print(ex)
        logger.debug(ex)
        return str(ex), 500


@app.route("/api/getAllTesters/", methods=["GET"])
def getAllTesters():
    try:
        connection = connect_db()
        cursor = connection.cursor()
        query = """SELECT * FROM testing"""
        cursor.execute(query, ())
        data = cursor.fetchall()
        cursor.close()
        connection.close()

        if not data:
            print("no testing data found")
            return jsonify({'message': 'no testing data found', 'code': 200 })
        else:
            return jsonify(data) , 200

    except Exception as ex:
        print(ex)
        logger.debug(ex)
        return str(ex), 500



if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
