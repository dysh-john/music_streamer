# Folder path: routes/youtube.py

from flask import Blueprint, render_template, send_from_directory, request, redirect
from config import Config
import os
import urllib.parse

home_bp = Blueprint('home', __name__)
MUSIC_DIR = Config.MUSIC_DIR

@home_bp.route('/')
def index():
    files = [f for f in os.listdir(MUSIC_DIR) if f.endswith(".mp3")]
    return render_template('index.html', files=files)

@home_bp.route('/music/<path:filename>')
def music(filename):
    return send_from_directory(MUSIC_DIR, filename)

@home_bp.route('/rename', methods=['POST'])
def rename_file():
    try:
        old_name = urllib.parse.unquote(request.form['old_name'])
        new_name = urllib.parse.unquote(request.form['new_name'])
        
        old_name = old_name if old_name.endswith('.mp3') else f"{old_name}.mp3"
        new_name = new_name if new_name.endswith('.mp3') else f"{new_name}.mp3"
        
        old_path = os.path.join(MUSIC_DIR, old_name)
        new_path = os.path.join(MUSIC_DIR, new_name)
        
        if not os.path.exists(old_path):
            raise FileNotFoundError(f"File '{old_name}' not found")
            
        os.rename(old_path, new_path)
        return redirect('/')
        
    except Exception as e:
        return f"Error: {str(e)}", 400