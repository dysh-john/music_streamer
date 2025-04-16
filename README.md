# My Music Streamer 🎶

A modern web-based music player for your local music collection with YouTube downloading capabilities.

![App Screenshot](screenshot.png)

## Features ✨

- 🎵 Play local MP3 files
- 📥 Download songs directly from YouTube
- 📋 Create and manage unlimited playlists
- 🔀 Shuffle and repeat modes
- 🎨 Automatic album art fetching
- ✏️ Rename tracks directly in the app
- 📱 Fully responsive design (works on mobile/tablet/desktop)
- 🎚️ Media controls in mobile notifications/desktop media keys

## Installation 💻

### Prerequisites
- Python 3.7+
- FFmpeg (for YouTube downloads)

### 1. Clone the repository
```bash
git clone https://github.com/yeh-john/music_streamer.git
cd music_streamer
```

### 2. Install dependencies
```bash
pip install flask yt-dlp mutagen
```

### 3. Create music directory
```bash
mkdir music
```

## Usage 🚀

### Starting the server
```bash
python app.py
```
The app will be available at: `http://localhost:5000`

### Adding Music
1. **Manual Add**:
   - Place MP3 files in the `music/` folder
   - They will appear automatically in the app

2. **YouTube Downloader**:
   - Paste any YouTube URL in the download form
   - Audio will be saved as `[Video Title].mp3`

### Playback Controls
- ▶️ Play/Pause: Spacebar or click
- ⏭ Next: Right arrow or button
- ⏮ Previous: Left arrow or button
- 🔀 Shuffle: Toggle random playback
- 🔁 Repeat: Toggle playlist looping

### Playlist Management
1. **Create Playlist**:
   - Click "New Playlist" button
   - Enter a name and click "Create"

2. **Add Songs**:
   - Play any song
   - Click "Add Current" to add to selected playlist
   - OR click the "+" button next to any track

3. **Remove Songs**:
   - Click the "×" button next to any track in playlist view

## File Structure 📂
```
music_streamer/
├── app.py                # Flask application
├── music/                # Directory for music files
├── static/
│   └── styles.css        # CSS stylesheet
├── templates/
│   └── index.html        # Main HTML template
└── README.md             # This file
```

## Troubleshooting 🛠️

### Common Issues
**Songs won't play:**
- Check browser console for errors (F12)
- Verify files exist in `music/` folder
- Ensure filenames don't contain special characters

**YouTube downloads fail:**
```bash
pip install --upgrade yt-dlp
```
- Ensure you have FFmpeg installed
- Try a different YouTube URL

**Playlists not saving:**
- Check if your browser blocks localStorage
- Look for JavaScript errors in console (F12)

## Support ❤️

If you enjoy this project, please consider starring it on GitHub!

## License 📄

MIT License - see [LICENSE](LICENSE) for details.

---

🎧 Happy listening! 🎧
