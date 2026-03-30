# Wellness Monitor

Wellness Monitor is a web-based tool designed to assess and monitor the mental health of patients by checking for signs of depression. 

## Tech Stack

1. React + Vite

    - React: A JavaScript library for building user interfaces.
    - Vite: A fast frontend development build tool that supports React.

2. Flask

    - Flask: A lightweight web application framework for Python.

3. MySQL Database

    - MySQL: An open-source relational database management system.

## Prerequisites

Before running the project, ensure that you have the following software installed on your machine:

1. Node.js and npm (for React + Vite)
2. Python (for Flask)
3. MySQL Server

## Getting Started

Follow these steps to set up and run the Wellness Monitor project:

 - Frontend (React + Vite)

    1. Navigate to the [frontend directory](./depression-app):
```bash
cd depression-app
```
    2. Install dependencies using npm:
```bash
npm install
```
    3. Start the development server:
```bash
npm run dev
```
    4. The backend server will be running at http://localhost:5173.

 - Backend (Flask)

    1. Navigate to the backend directory:
```bash
cd server
```
    2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
```
    3. Activate the virtual environment:

    - On Windows:
```bash
venv\Scripts\activate
```
    - On macOS/Linux:
```bash
source venv/bin/activate
```
    4. Install dependencies:
```bash
pip install -r requirements.txt
```
    5. Run the Flask application:
```bash
python app.py
```
    6. The backend server will be running at http://localhost:5000.

SETUP INSTRUCTION
1. Node.js and npm (version 21.0)
2. Python (3.10.7)
3. MySQL Server(set authentication also)
4.on terminal run - winget install --d = Gyan.FFmpeg -e
5. check version - ffmpg --version
6. download visual studio installer from chrome 
7.pip install dlib
8. pip install cmake
9. change password in server.py as database password
10 . npm run dev (for frontend)(inside vscode)
11. set vertual environment - 
	1. python -m venv newenv
	2. pip install -r requirements.txt
11. in other terminal- cd server
12. make datbase in workbench - create database wellness_monitor;
				use wellness_monitor;
				create table users(name varchar(50), mobile int, email varchar(50)primary key, password varchar(512), gender varchar(20), dob gate, age int);
To run after setup - 
1 . open mysql workbench
2. goto database tab and connect to database
3. open flder in vs code
4. in one terminal:
	cd depression-app
	npm run dev
5. in second terminal:
	cd server
	python server.py
6. now go to site and start diagnosis.

To check value in sql
1. use wellness_monitor;
2. select * from users;
3. select * from testing;
