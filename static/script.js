// Player elements
const player = document.getElementById("player")
const nowPlaying = document.getElementById("now-playing")
const nowPlayingArtist = document.getElementById("now-playing-artist")
const albumArt = document.getElementById("albumArt")
const playButton = document.getElementById("playButton")
const playIcon = document.getElementById("playIcon")
const pauseIcon = document.getElementById("pauseIcon")
const mobilePlayIcon = document.getElementById("mobilePlayIcon")
const mobilePauseIcon = document.getElementById("mobilePauseIcon")
const progressFill = document.getElementById("progressFill")
const currentTimeEl = document.getElementById("currentTime")
const totalTimeEl = document.getElementById("totalTime")
const volumeSlider = document.getElementById("volumeSlider")
const shuffleButton = document.getElementById("shuffleButton")
const repeatButton = document.getElementById("repeatButton")
const mobilePlayerImg = document.getElementById("mobilePlayerImg")
const mobilePlayerTitle = document.getElementById("mobilePlayerTitle")
const mobilePlayerArtist = document.getElementById("mobilePlayerArtist")

// View elements
const gridViewBtn = document.getElementById("gridViewBtn")
const listViewBtn = document.getElementById("listViewBtn")
const trackGrid = document.getElementById("trackGrid")
const trackList = document.getElementById("trackList")

// Track elements
const trackElements = document.querySelectorAll(".track-card")
const listTrackElements = document.querySelectorAll(".track-list-item")
let currentIndex = 0
let currentActiveElement = null
let isShuffle = false
let isRepeat = false
let isPlaying = false
let currentView = "grid" // Default view
let playlist = Array.from(trackElements)
const listPlaylist = Array.from(listTrackElements)

// Pagination variables
const itemsPerPage = 24
let currentPage = 1
let totalPages = 1

// Playlist functionality
let currentPlaylist = null
const playlists = JSON.parse(localStorage.getItem("playlists")) || {}
let currentPlaylistTracks = []

// Initialize player
function initPlayer() {
  // Set up progress bar update
  player.addEventListener("timeupdate", updateProgress)

  // Set up volume control
  volumeSlider.addEventListener("input", () => {
    player.volume = volumeSlider.value
  })

  // Set up progress bar click
  document.querySelector(".progress-bar").addEventListener("click", setProgress)

  // Set up player ended event
  player.addEventListener("ended", () => next())

  // Set up play/pause events
  player.addEventListener("play", () => {
    isPlaying = true
    updatePlayButton(true)
  })

  player.addEventListener("pause", () => {
    isPlaying = false
    updatePlayButton(false)
  })

  // Initialize playlists
  refreshPlaylists()
  updateSidebarPlaylists()

  // Set default view
  switchView("grid")

  // Initialize pagination
  updatePagination()
}

// Format time in MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

// Update progress bar
function updateProgress() {
  const { currentTime, duration } = player
  if (duration) {
    const progressPercent = (currentTime / duration) * 100
    progressFill.style.width = `${progressPercent}%`
    currentTimeEl.textContent = formatTime(currentTime)
    totalTimeEl.textContent = formatTime(duration)
  } else {
    progressFill.style.width = "0%"
    currentTimeEl.textContent = "0:00"
    totalTimeEl.textContent = "0:00"
  }
}

// Set progress when clicking on progress bar
function setProgress(e) {
  const width = this.clientWidth
  const clickX = e.offsetX
  const duration = player.duration

  if (duration) {
    player.currentTime = (clickX / width) * duration
  }
}

// Update play button state
function updatePlayButton(isPlaying) {
  if (isPlaying) {
    playIcon.style.display = "none"
    pauseIcon.style.display = "block"
    mobilePlayIcon.style.display = "none"
    mobilePauseIcon.style.display = "block"
  } else {
    playIcon.style.display = "block"
    pauseIcon.style.display = "none"
    mobilePlayIcon.style.display = "block"
    mobilePauseIcon.style.display = "none"
  }
}

// Update shuffle button state
function updateShuffleButton() {
  if (isShuffle) {
    shuffleButton.classList.add("active")
    shuffleButton.style.color = "var(--primary)"
  } else {
    shuffleButton.classList.remove("active")
    shuffleButton.style.color = ""
  }
}

// Update repeat button state
function updateRepeatButton() {
  if (isRepeat) {
    repeatButton.classList.add("active")
    repeatButton.style.color = "var(--primary)"
  } else {
    repeatButton.classList.remove("active")
    repeatButton.style.color = ""
  }
}

// Switch between grid and list view
function switchView(view) {
  currentView = view

  if (view === "grid") {
    trackGrid.style.display = "grid"
    trackList.style.display = "none"
    gridViewBtn.classList.add("active")
    listViewBtn.classList.remove("active")
    playlist = Array.from(document.querySelectorAll(".track-card"))
  } else {
    trackGrid.style.display = "none"
    trackList.style.display = "flex"
    gridViewBtn.classList.remove("active")
    listViewBtn.classList.add("active")
    playlist = Array.from(document.querySelectorAll(".track-list-item"))
  }

  // Update pagination
  updatePagination()
}

// Update pagination
function updatePagination() {
  const allTracks =
    currentView === "grid" ? document.querySelectorAll(".track-card") : document.querySelectorAll(".track-list-item")

  totalPages = Math.ceil(allTracks.length / itemsPerPage)

  if (totalPages <= 1) {
    document.getElementById("pagination").innerHTML = ""
    return
  }

  let paginationHTML = ""

  // Previous button
  paginationHTML += `<button class="pagination-button" ${currentPage === 1 ? "disabled" : ""} onclick="goToPage(${currentPage - 1})">
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
  </button>`

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="pagination-button active">${i}</button>`
    } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `<button class="pagination-button" onclick="goToPage(${i})">${i}</button>`
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`
    }
  }

  // Next button
  paginationHTML += `<button class="pagination-button" ${currentPage === totalPages ? "disabled" : ""} onclick="goToPage(${currentPage + 1})">
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  </button>`

  document.getElementById("pagination").innerHTML = paginationHTML

  // Show/hide tracks based on current page
  showCurrentPageTracks()
}

// Go to specific page
function goToPage(page) {
  currentPage = page
  updatePagination()
}

// Show tracks for current page
function showCurrentPageTracks() {
  const allTracks =
    currentView === "grid" ? document.querySelectorAll(".track-card") : document.querySelectorAll(".track-list-item")

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  Array.from(allTracks).forEach((track, index) => {
    if (index >= startIndex && index < endIndex) {
      track.style.display = ""
    } else {
      track.style.display = "none"
    }
  })
}

// Play a track
function playTrack(filename, element, isFromPlaylist = false, event = null) {
  // Stop propagation to prevent conflicts with buttons
  if (event) event.stopPropagation()

  // Set the audio source with proper encoding
  player.src = "/music/" + encodeURIComponent(filename)

  // Update UI
  const title = parseTitle(filename)
  const artist = parseArtist(filename)

  nowPlaying.textContent = title
  nowPlayingArtist.textContent = artist
  mobilePlayerTitle.textContent = title
  mobilePlayerArtist.textContent = artist

  // Update active track styling
  if (currentActiveElement) {
    currentActiveElement.classList.remove("active")
  }

  currentActiveElement = element
  if (element) element.classList.add("active")

  // Play the audio
  player
    .play()
    .then(() => {
      isPlaying = true
      updatePlayButton(true)

      // Update current index based on context
      if (isFromPlaylist && currentPlaylist) {
        currentIndex = currentPlaylistTracks.indexOf(filename)
      } else {
        if (currentView === "grid") {
          currentIndex = Array.from(document.querySelectorAll(".track-card")).findIndex(
            (track) => track.dataset.file === filename,
          )
        } else {
          currentIndex = Array.from(document.querySelectorAll(".track-list-item")).findIndex(
            (track) => track.dataset.file === filename,
          )
        }
      }

      // Update album art
      const ytID = extractYouTubeID(filename)
      const artworkUrl = `https://img.youtube.com/vi/${ytID}/maxresdefault.jpg`
      albumArt.src = artworkUrl
      mobilePlayerImg.src = artworkUrl

      albumArt.onerror = () => {
        albumArt.src = "https://via.placeholder.com/400?text=No+Art"
        mobilePlayerImg.src = "https://via.placeholder.com/40?text=No+Art"
      }

      // Update media session
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title,
          artist: artist,
          artwork: [{ src: albumArt.src, sizes: "400x400", type: "image/jpeg" }],
        })

        navigator.mediaSession.setActionHandler("play", () => togglePlay())
        navigator.mediaSession.setActionHandler("pause", () => togglePlay())
        navigator.mediaSession.setActionHandler("previoustrack", () => prev())
        navigator.mediaSession.setActionHandler("nexttrack", () => next())
      }
    })
    .catch((error) => {
      console.error("Playback failed:", error)
      alert("Error playing track. Please check console for details.")
    })
}

// Toggle play/pause
function togglePlay() {
  if (isPlaying) {
    player.pause()
  } else {
    if (player.src) {
      player.play().catch((error) => console.error("Playback failed:", error))
    }
  }
}

// Play next track
function next() {
  if (currentPlaylist && currentPlaylistTracks.length > 0) {
    // Playlist mode
    if (isShuffle) {
      currentIndex = Math.floor(Math.random() * currentPlaylistTracks.length)
    } else {
      currentIndex = (currentIndex + 1) % currentPlaylistTracks.length
    }
    if (isRepeat && currentIndex >= currentPlaylistTracks.length) currentIndex = 0

    const track = currentPlaylistTracks[currentIndex]
    const container = document.getElementById("currentPlaylistTracks")
    const trackElements = container.querySelectorAll(".playlist-track")
    if (trackElements[currentIndex]) {
      playTrack(track, trackElements[currentIndex], true)
    }
  } else {
    // Normal mode
    const tracks =
      currentView === "grid" ? document.querySelectorAll(".track-card") : document.querySelectorAll(".track-list-item")

    if (tracks.length === 0) return

    if (isShuffle) {
      currentIndex = Math.floor(Math.random() * tracks.length)
    } else {
      currentIndex = (currentIndex + 1) % tracks.length
    }

    if (isRepeat && currentIndex >= tracks.length) currentIndex = 0

    const nextTrack = tracks[currentIndex]
    if (nextTrack && nextTrack.style.display !== "none") {
      const filename = nextTrack.dataset.file
      playTrack(filename, nextTrack)
    } else {
      // If track is hidden (pagination), find next visible track
      for (let i = 0; i < tracks.length; i++) {
        const idx = (currentIndex + i) % tracks.length
        if (tracks[idx].style.display !== "none") {
          const filename = tracks[idx].dataset.file
          currentIndex = idx
          playTrack(filename, tracks[idx])
          break
        }
      }
    }
  }
}

// Play previous track
function prev() {
  if (currentPlaylist && currentPlaylistTracks.length > 0) {
    // Playlist mode
    currentIndex = (currentIndex - 1 + currentPlaylistTracks.length) % currentPlaylistTracks.length
    const track = currentPlaylistTracks[currentIndex]
    const container = document.getElementById("currentPlaylistTracks")
    const trackElements = container.querySelectorAll(".playlist-track")
    if (trackElements[currentIndex]) {
      playTrack(track, trackElements[currentIndex], true)
    }
  } else {
    // Normal mode
    const tracks =
      currentView === "grid" ? document.querySelectorAll(".track-card") : document.querySelectorAll(".track-list-item")

    if (tracks.length === 0) return

    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length

    const prevTrack = tracks[currentIndex]
    if (prevTrack && prevTrack.style.display !== "none") {
      const filename = prevTrack.dataset.file
      playTrack(filename, prevTrack)
    } else {
      // If track is hidden (pagination), find previous visible track
      for (let i = 0; i < tracks.length; i++) {
        const idx = (currentIndex - i + tracks.length) % tracks.length
        if (tracks[idx].style.display !== "none") {
          const filename = tracks[idx].dataset.file
          currentIndex = idx
          playTrack(filename, tracks[idx])
          break
        }
      }
    }
  }
}

// Toggle shuffle
function toggleShuffle() {
  isShuffle = !isShuffle
  updateShuffleButton()

  showToast(isShuffle ? "Shuffle: On" : "Shuffle: Off")
}

// Toggle repeat
function toggleRepeat() {
  isRepeat = !isRepeat
  updateRepeatButton()

  showToast(isRepeat ? "Repeat: On" : "Repeat: Off")
}

// Filter tracks by search
function filterList() {
  const input = document.getElementById("searchInput").value.toLowerCase()

  // Filter grid view
  const gridTracks = document.querySelectorAll(".track-card")
  gridTracks.forEach((item) => {
    const txt = item.textContent.toLowerCase()
    item.style.display = txt.includes(input) ? "" : "none"
  })

  // Filter list view
  const listTracks = document.querySelectorAll(".track-list-item")
  listTracks.forEach((item) => {
    const txt = item.textContent.toLowerCase()
    item.style.display = txt.includes(input) ? "" : "none"
  })

  // Reset pagination if searching
  if (input.trim() !== "") {
    document.getElementById("pagination").innerHTML = ""
  } else {
    currentPage = 1
    updatePagination()
  }
}

// Extract YouTube ID from title
function extractYouTubeID(title) {
  const regex = /$$([a-zA-Z0-9_-]{11})$$/
  const match = title.match(regex)
  return match ? match[1] : "LvBZI0Qw_YA"
}

// Parse title from filename
function parseTitle(filename) {
  return filename.replace(".mp3", "").split(" - ")[0] || filename
}

// Parse artist from filename
function parseArtist(filename) {
  const parts = filename.replace(".mp3", "").split(" - ")
  return parts.length > 1 ? parts[1] : "Unknown Artist"
}

// Show rename modal
let currentTrackToRename = ""
function showRenameModal(filename, event) {
  if (event) event.stopPropagation()
  currentTrackToRename = filename
  const modal = document.getElementById("renameModal")
  const input = document.getElementById("newTrackName")
  input.value = filename.replace(".mp3", "")
  modal.style.display = "block"
}

// Close rename modal
function closeRenameModal() {
  document.getElementById("renameModal").style.display = "none"
}

// Submit rename
function submitRename() {
  const newName = document.getElementById("newTrackName").value.trim()
  if (!newName || newName === currentTrackToRename.replace(".mp3", "")) {
    closeRenameModal()
    return
  }

  const formattedNewName = newName.endsWith(".mp3") ? newName : newName + ".mp3"

  fetch("/rename", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `old_name=${encodeURIComponent(currentTrackToRename)}&new_name=${encodeURIComponent(formattedNewName)}`,
  })
    .then((response) => {
      if (!response.ok) throw new Error("Rename failed")
      window.location.reload()
    })
    .catch((error) => {
      alert(error.message)
      closeRenameModal()
    })
}

// Refresh playlists in select dropdown
function refreshPlaylists() {
  const select = document.getElementById("playlistSelect")
  select.innerHTML = '<option value="">Select a playlist</option>'

  for (const name in playlists) {
    const option = document.createElement("option")
    option.value = name
    option.textContent = name
    select.appendChild(option)
  }
}

// Update sidebar playlists
function updateSidebarPlaylists() {
  const container = document.getElementById("sidebarPlaylists")
  container.innerHTML = ""

  for (const name in playlists) {
    const item = document.createElement("div")
    item.className = "playlist-item"
    item.textContent = name
    item.onclick = () => {
      document.getElementById("playlistSelect").value = name
      loadPlaylist()
    }
    container.appendChild(item)
  }
}

// Create new playlist
function createPlaylist() {
  const name = document.getElementById("newPlaylistName").value.trim()
  if (name && !playlists[name]) {
    playlists[name] = []
    localStorage.setItem("playlists", JSON.stringify(playlists))
    refreshPlaylists()
    updateSidebarPlaylists()
    closeModal("newPlaylistModal")
    showToast(`Playlist "${name}" created`)
  } else {
    alert("Playlist name already exists or is invalid!")
  }
}

// Load playlist
function loadPlaylist() {
  const playlistName = document.getElementById("playlistSelect").value
  currentPlaylist = playlistName
  currentPlaylistTracks = playlists[playlistName] || []
  const container = document.getElementById("currentPlaylistTracks")
  container.innerHTML = ""

  // Update sidebar active state
  const sidebarItems = document.querySelectorAll(".playlist-item")
  sidebarItems.forEach((item) => {
    if (item.textContent === playlistName) {
      item.classList.add("active")
    } else {
      item.classList.remove("active")
    }
  })

  if (playlistName && currentPlaylistTracks.length > 0) {
    document.getElementById("addToPlaylistBtn").disabled = false

    currentPlaylistTracks.forEach((track, index) => {
      const trackEl = document.createElement("div")
      trackEl.className = "playlist-track"
      trackEl.innerHTML = `
                <img class="playlist-track-img" 
                    src="https://img.youtube.com/vi/${extractYouTubeID(track)}/default.jpg"
                    onerror="this.src='https://via.placeholder.com/40?text=No+Art'">
                <div class="playlist-track-info">
                    <div class="playlist-track-title">${parseTitle(track)}</div>
                    <div class="playlist-track-artist">${parseArtist(track)}</div>
                </div>
                <div class="playlist-track-remove" onclick="event.stopPropagation(); removeFromPlaylist('${playlistName}', '${track}')">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
            `
      trackEl.onclick = (e) => {
        currentIndex = index
        playTrack(track, trackEl, true, e)
      }
      container.appendChild(trackEl)
    })
  } else {
    document.getElementById("addToPlaylistBtn").disabled = true
    container.innerHTML = '<div class="empty-playlist-message">No tracks in this playlist</div>'
  }
}

// Add current track to playlist
function addToPlaylist() {
  if (!currentPlaylist || !player.src) return

  const trackPath = decodeURIComponent(player.src.split("/music/")[1])
  if (!playlists[currentPlaylist].includes(trackPath)) {
    playlists[currentPlaylist].push(trackPath)
    localStorage.setItem("playlists", JSON.stringify(playlists))
    loadPlaylist()
    showToast(`Added to "${currentPlaylist}"`)
  }
}

// Remove track from playlist
function removeFromPlaylist(playlistName, trackPath, event) {
  if (event) event.stopPropagation()
  playlists[playlistName] = playlists[playlistName].filter((t) => t !== trackPath)
  localStorage.setItem("playlists", JSON.stringify(playlists))
  loadPlaylist()
  showToast(`Removed from "${playlistName}"`)
}

// Show new playlist modal
function showNewPlaylistModal() {
  document.getElementById("newPlaylistName").value = ""
  document.getElementById("newPlaylistModal").style.display = "block"
}

// Close modal
function closeModal(id) {
  document.getElementById(id).style.display = "none"
}

// Show add to playlist modal
function showAddToPlaylistModal(trackPath, event) {
  if (event) event.stopPropagation()
  const modal = document.getElementById("addToPlaylistModal")
  const select = document.getElementById("playlistSelectModal")

  // Store current track in modal dataset
  modal.dataset.currentTrack = trackPath

  // Populate playlist dropdown
  select.innerHTML = '<option value="">Select playlist</option>'
  for (const name in playlists) {
    const option = document.createElement("option")
    option.value = name
    option.textContent = name
    select.appendChild(option)
  }

  modal.style.display = "block"
}

// Add track to playlist from modal
function addTrackToPlaylist() {
  const modal = document.getElementById("addToPlaylistModal")
  const playlistName = document.getElementById("playlistSelectModal").value
  const trackPath = modal.dataset.currentTrack

  if (playlistName && trackPath) {
    if (!playlists[playlistName]) {
      playlists[playlistName] = []
    }

    if (!playlists[playlistName].includes(trackPath)) {
      playlists[playlistName].push(trackPath)
      localStorage.setItem("playlists", JSON.stringify(playlists))

      // Refresh if viewing this playlist
      if (currentPlaylist === playlistName) {
        loadPlaylist()
      }
    }

    closeModal("addToPlaylistModal")
    showToast(`Added to "${playlistName}"`)
  }
}

// Show toast notification
function showToast(message) {
  // Remove existing toast if present
  const existingToast = document.querySelector(".toast")
  if (existingToast) {
    document.body.removeChild(existingToast)
  }

  const toast = document.createElement("div")
  toast.className = "toast"
  toast.innerHTML = `
    <div class="toast-content">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${message}</span>
    </div>
  `
  document.body.appendChild(toast)

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.add("toast-hide")
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

// Initialize on load
window.addEventListener("DOMContentLoaded", () => {
  initPlayer()

  // Update add button state when track plays
  player.addEventListener("play", () => {
    if (currentPlaylist) {
      document.getElementById("addToPlaylistBtn").disabled = false
    }
  })

  // Set up keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Space bar for play/pause
    if (e.code === "Space" && e.target.tagName !== "INPUT") {
      e.preventDefault()
      togglePlay()
    }

    // Left arrow for previous track
    if (e.code === "ArrowLeft" && e.target.tagName !== "INPUT") {
      prev()
    }

    // Right arrow for next track
    if (e.code === "ArrowRight" && e.target.tagName !== "INPUT") {
      next()
    }
  })
})

// Close modal when clicking outside
window.onclick = (event) => {
  const renameModal = document.getElementById("renameModal")
  const newPlaylistModal = document.getElementById("newPlaylistModal")
  const addToPlaylistModal = document.getElementById("addToPlaylistModal")

  if (event.target == renameModal) {
    closeRenameModal()
  }
  if (event.target == newPlaylistModal) {
    closeModal("newPlaylistModal")
  }
  if (event.target == addToPlaylistModal) {
    closeModal("addToPlaylistModal")
  }
}

// Add toast styles
const style = document.createElement("style")
style.textContent = `
.toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background-color: var(--surface);
    color: var(--text);
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: toastIn 0.3s ease;
    display: flex;
    align-items: center;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.toast-content svg {
    color: var(--primary);
}

.toast-hide {
    animation: toastOut 0.3s ease forwards;
}

@keyframes toastIn {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes toastOut {
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(20px);
        opacity: 0;
    }
}
`
document.head.appendChild(style)
