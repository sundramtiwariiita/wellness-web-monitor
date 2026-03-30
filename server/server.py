from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pymysql
import json
import os
from werkzeug.security import generate_password_hash, check_password_hash
from moviepy.editor import VideoFileClip
from io import BytesIO
from helper_function import (
    convert_blob_to_mp4,
    delete_file
)
import datetime
import logging
import cv2
import shutil
import base64
import io
import tempfile
import subprocess

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '12345678'
app.config['MYSQL_DB'] = 'wellness_monitor'
app.config['MYSQL_PORT'] = 3306 
CORS(app)

# Set up logging
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

@app.route('/')
def index():
    connection = connect_db()
    cursor = connection.cursor()
    cursor.execute("SELECT VERSION()")
    data = cursor.fetchone()
    cursor.close()
    connection.close()
    return f"Connected to MySQL, Server version: {data[0]}"

@app.route("/addUser", methods=["POST"])
def addUser():
    try:
        userData = request.get_json()
        name, mobile, email, password, gender, dob, age = userData["name"], userData['mobile'], userData['email'], userData['password'], userData['gender'], userData['dob'], userData['age']
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        connection = connect_db()
        cursor = connection.cursor()
        query = """INSERT INTO users (name, mobile, email, password, gender, dob, age) VALUES(%s,%s,%s,%s,%s,%s,%s)"""
        cursor.execute(query, (name, mobile, email, hashed_password, gender, dob, age))
        connection.commit()
        cursor.close()
        connection.close()
        return jsonify({'message': 'Data inserted successfully', 'code': 200})
    except Exception as ex:
        logger.debug(str(ex))
        return jsonify({'message': str(ex), 'error': 'Data not inserted', 'code': 500})

@app.route("/getUser/<email>/<password>", methods=["GET"])
def getUser(email, password):
    try:
        connection = connect_db()
        cursor = connection.cursor()
        query = """SELECT * FROM users WHERE email=%s"""
        cursor.execute(query, (email,))
        data = cursor.fetchall()
        cursor.close()
        connection.close()
        
        if not data:
            logger.debug("credentials not found")
            return jsonify({'message': 'credentials not found', 'error': 'Bad Request', 'code': 404})
        else:
            user_stored_password = data[0][3]
            if check_password_hash(user_stored_password, password):
                return jsonify({'data': data, 'message': 'login successful', 'code': 200}), 200
            else:
                logger.debug('invalid password')
                return jsonify({'message': 'invalid password', 'error': 'Bad Request', 'code': 404}), 404
    except Exception as ex:
        logger.debug(str(ex))
        return jsonify({'message': str(ex), 'error': 'User not found', 'code': 500}), 500

def getVideo(email):
    from features import (
        get_final_results
    )

    ct = datetime.datetime.now()
    results, code, msg = get_final_results(email, logger)
    if code == 500:
        try:
            current_directory = os.path.dirname(os.path.abspath(__file__))
            delete_file(os.path.join(current_directory, 'video_'+ email + '.mp4'))
            delete_file(os.path.join(current_directory, 'transcription_' + email + '.txt'))
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
            current_directory = os.path.dirname(os.path.abspath(__file__))
            delete_file(os.path.join(current_directory, 'video_'+ email + '.mp4'))
            delete_file(os.path.join(current_directory, 'transcription_' + email + '.txt'))
        except:
            pass
        
        logger.debug(msg)
        return jsonify({'message': str(e), 'error': 'Database error', 'code': 500})
    current_directory = os.path.dirname(os.path.abspath(__file__))
    delete_file(os.path.join(current_directory, 'video_'+ email + '.mp4'))
    delete_file(os.path.join(current_directory, 'transcription_' + email + '.txt'))
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

@app.route("/convertVideo", methods=["POST"])
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
                return jsonify({'message': 'Assembling of video failed', 'code': 500})
            msg, response, code = getVideo(email)
            return jsonify({'message': response, 'code': code}), code

        return jsonify({'message': 'Chunk uploaded successfully', 'code': 200}), 200

    except Exception as ex:
        logger.debug(ex)
        return jsonify({'message': str(ex), 'code': 500}), 500

@app.route("/convertToMP4", methods=["POST"])
def convertToMP4():
    try:
        file = request.files['file']
        current_directory = os.path.dirname(os.path.abspath(__file__))
        filename = file.filename
        temp_path = os.path.join(current_directory, 'temp_' + filename)
        file.save(temp_path)

        mp4_path = os.path.join(current_directory, filename.rsplit('.', 1)[0] + '.mp4')
        convert_blob_to_mp4(temp_path, mp4_path)

        os.remove(temp_path)

        return send_file(mp4_path, as_attachment=True)
    except Exception as ex:
        logger.debug(ex)
        return jsonify({'message': str(ex), 'code': 500}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


