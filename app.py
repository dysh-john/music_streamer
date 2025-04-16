# Folder path: app.py

from flask import Flask, request, redirect  # ADD 'redirect' HERE
from config import Config
from routes.home import home_bp
from routes.youtube import yt_bp
import os

app = Flask(__name__)
app.config.from_object(Config)



# Register blueprints
app.register_blueprint(home_bp)
app.register_blueprint(yt_bp)



@app.context_processor
def utility_processor():
    def parse_title(filename):
        return filename.replace('.mp3', '').split(' - ')[0]
    
    def parse_artist(filename):
        parts = filename.replace('.mp3', '').split(' - ')
        return parts[1] if len(parts) > 1 else 'Unknown Artist'
    
    def extract_youtube_id(filename):
        import re
        match = re.search(r'\(([a-zA-Z0-9_-]{11})\)', filename)
        return match.group(1) if match else 'LvBZI0Qw_YA'
    
    return dict(
        parse_title=parse_title,
        parse_artist=parse_artist,
        extract_youtube_id=extract_youtube_id
    )



# Add this route
@app.route('/rename', methods=['POST'])
def rename_file():
    try:
        old_name = request.form['old_name']
        new_name = request.form['new_name']
        
        # Ensure proper file extensions
        if not old_name.endswith('.mp3'):
            old_name += '.mp3'
        if not new_name.endswith('.mp3'):
            new_name += '.mp3'
            
        old_path = os.path.join(MUSIC_DIR, old_name)
        new_path = os.path.join(MUSIC_DIR, new_name)
        
        if not os.path.exists(old_path):
            return "Original file not found", 404
            
        os.rename(old_path, new_path)
        return redirect('/')
        
    except Exception as e:
        return f"Error renaming file: {str(e)}", 500


@app.route('/music/<path:filename>')
def music(filename):
    return send_from_directory(MUSIC_DIR, filename)


@app.route('/playlists', methods=['GET', 'POST'])
def handle_playlists():
    if request.method == 'GET':
        # Return existing playlists
        playlists_file = os.path.join(app.root_path, 'playlists.json')
        if os.path.exists(playlists_file):
            with open(playlists_file) as f:
                return jsonify(json.load(f))
        return jsonify({})
    
    elif request.method == 'POST':
        # Save new playlist
        data = request.get_json()
        playlists_file = os.path.join(app.root_path, 'playlists.json')
        
        existing = {}
        if os.path.exists(playlists_file):
            with open(playlists_file) as f:
                existing = json.load(f)
        
        existing.update(data)
        
        with open(playlists_file, 'w') as f:
            json.dump(existing, f)
        
        return jsonify({'status': 'success'})

if __name__ == '__main__':
    os.makedirs(Config.MUSIC_DIR, exist_ok=True)
    app.run(host="0.0.0.0", port=5000, debug=True)