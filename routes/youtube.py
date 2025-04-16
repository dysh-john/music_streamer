from flask import Blueprint, request, redirect
from config import Config
import subprocess
import os  # Add this line

yt_bp = Blueprint('youtube', __name__)
MUSIC_DIR = Config.MUSIC_DIR

@yt_bp.route('/download', methods=['POST'])
def download():
    url = request.form['url']
    if url:
        cmd = [
            "yt-dlp",
            "--extract-audio",
            "--audio-format", "mp3",
            "-o", f"{MUSIC_DIR}/%(title)s.%(ext)s",
            url
        ]
        subprocess.Popen(cmd)
    return redirect('/')