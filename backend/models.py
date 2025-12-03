from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy 
from dotenv import load_dotenv
import psycopg2
import os 

load_dotenv()

app = Flask(__name__)

DB_USER= os.getenv("DB_USER")
DB_PASSWORD= os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

conn = psycopg2.connect(database=DB_NAME , user = DB_USER, password = DB_PASSWORD, host = DB_HOST, port = DB_PORT)
cur = conn.cursor()



##Tables 

#1.) User Table
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    preferred_style_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (preferred_style_id) REFERENCES styles(style_id)
);
""")

#2.) Styles Table
cur.execute("""
CREATE TABLE IF NOT EXISTS styles (
    style_id SERIAL PRIMARY KEY,
    style_name VARCHAR(100) NOT NULL,
    style_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

#3.) Projects Table 
cur.execute("""
CREATE TABLE IF NOT EXISTS projects (
    project_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    style_id INTEGER,
    project_title VARCHAR(200),
    room_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (style_id) REFERENCES styles(style_id)
);
""")

#4.) Input_Images Table
cur.execute("""
CREATE TABLE IF NOT EXISTS input_images (
    input_image_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_format VARCHAR(10),
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
""")

#5.) Generated_Images Table
cur.execute("""
CREATE TABLE IF NOT EXISTS generated_images (
    generated_image_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    style_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    generation_time_ms INTEGER,
    model_version VARCHAR(50),
    ssim_score FLOAT,
    fid_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id),
    FOREIGN KEY (style_id) REFERENCES styles(style_id)
);
""")

#6.) Detected_Objects Table
cur.execute("""
CREATE TABLE IF NOT EXISTS detected_objects (
    object_id SERIAL PRIMARY KEY,
    input_image_id INTEGER NOT NULL,
    category VARCHAR(100),
    confidence FLOAT,
    bbox_x FLOAT,
    bbox_y FLOAT,
    bbox_width FLOAT,
    bbox_height FLOAT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (input_image_id) REFERENCES input_images(input_image_id)
);
""")

#7.) Activity_Log Table
cur.execute("""
CREATE TABLE IF NOT EXISTS activity_log (
    activity_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    project_id INTEGER,
    activity_type VARCHAR(50),
    description TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);
""")

conn.commit()
cur.close()
conn.close()

db = SQLAlchemy(app)