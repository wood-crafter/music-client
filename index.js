const API_ROOT = 'http://localhost:8082'

const PREVIEW_CONTAINER_ID = 'preview-container'

document.querySelector(`#logout`).addEventListener('click', () => {
  localStorage.removeItem('token')
  window.location = '/login.html'
  return
})

document.querySelector(`#upload`).addEventListener('submit', e => {
  e.preventDefault()

  const songName = document.querySelector('#songName').value
  const fileUpload = document.querySelector(`#fileUpload`).files[0]
  //TODO: filter file
  let formData = new FormData()
  formData.append("songName", songName)
  formData.append("song", fileUpload)

  apiFetch('/upload', 'POST', formData).then(res => {
    const p = document.createElement('p')
    p.innerText = res.statusText
    document.querySelector("#uploadStatus").appendChild(p)
  }).catch(res => {
    const p = document.createElement('p')
    p.innerText = 'Some thing went wrong!'
    document.querySelector("#uploadStatus").appendChild(p)
  })
})

apiFetch(`/auth`, 'HEAD').then(res => {
  if (res.status === 401) {
    window.location = '/login.html'
    return
  }

  renderPage()
})

function renderPage() {
  const res = apiFetch(`/public`)

  res.then(res => {
    if (res.ok) {
      return res.json()
    }
  }).then(files => {
    files.forEach(filename => {
      const div = document.createElement('div')
      appendSongs(filename, div)
      appendButton(filename, div)

      document.querySelector("#songs").appendChild(div)
    })
  })
}

function appendSongs(filename, div) {
  const a = document.createElement('a')

  const fileUrl = `${API_ROOT}/public/${filename}`
  apiFetch(`/public/songName/${filename}`)
    .then(result => {
      return result.text()
    })
    .then(result => {
      a.href = fileUrl
      a.download = filename
      a.innerText = result

      a.style.display = 'block'

      addEventSong(filename, a)

      div.appendChild(a)
    })
}

function renderPlaylist(filename) {
  const res = apiFetch(`/playlist_getAll`)

  res.then(res => {
    if (res.ok) {
      return res.json()
    }
  }).then(playlists => {

    while (document.querySelector("#playlist").firstChild) {
      document.querySelector("#playlist").firstChild.remove()
    }

    playlists.forEach(playlist => {
      appendPlaylist(playlist, filename)
    })

    appendAddPlaylist(filename)
  })
}

function appendAddPlaylist(filename) {
  const div = document.createElement('div')
  const songId = filename.substring(0, filename.indexOf('.'))
  const button = document.createElement('BUTTON')

  button.addEventListener('click', () => {
    const enterName = document.createElement("INPUT");
    enterName.setAttribute("type", "text")

    div.appendChild(enterName)
    addCreatePlaylist(div, enterName, songId)
  })

  div.appendChild(button)
  document.querySelector(`#playlist`).appendChild(div)
}

function addCreatePlaylist(div, input, songId) {
  const create = document.createElement('BUTTON')

  create.addEventListener('click', () => {
    if (input.value) {
      const body = { title: input.value, songId: songId }
      apiFetch(`/playlist/thisSong`, 'POST', JSON.stringify(body))
        .then(result => {
          console.info('OK!')
        })
    } else {
      console.info('Name!')
    }
  })

  div.appendChild(create)
}

function appendPlaylist(playlist, filename) {
  const songId = filename.substring(0, filename.indexOf('.'))
  const div = document.createElement('div')
  div.innerHTML = playlist.title
  const checkbox = document.createElement("INPUT")
  checkbox.setAttribute("type", "checkbox")
  //Check if playlist contain this song
  const body = {songId: songId, playlistId: playlist.id}
  apiFetch(`/playlist_containSong`, 'POST', JSON.stringify(body))
    .then(res => {
      return res.json()
    })
    .then(result => {
      if (result.length) {
        checkbox.checked = true
      }
    })

  checkbox.addEventListener('change', function () {
    if (this.checked) {
      const body = { song_id: songId, playlist_id: playlist.id }
      console.info(JSON.stringify(body))
      apiFetch(`/playlist/song`, 'POST', JSON.stringify(body))
    } else {
      const body = { song_id: songId, playlist_id: playlist.id }
      apiFetch(`/playlist/song`, 'DELETE', JSON.stringify(body))
    }
  })

  div.appendChild(checkbox)
  document.querySelector(`#playlist`).appendChild(div)
}

function appendButton(filename, div) {
  const button = document.createElement('BUTTON')
  button.id = filename

  button.addEventListener('click', () => {
    document.querySelector(`#myModal`).style.display = "block"
    renderPlaylist(filename)
  })

  div.appendChild(button)
}

function addEventSong(filename, a) {
  a.addEventListener('click', (e) => {
    let canBeOpened = true

    switch (true) {
      case filename.endsWith('.mp4'): {
        getVideo(filename)
        break
      }
      case filename.endsWith('.mp3'): {
        getAudio(filename)
        break
      }
      default:
        canBeOpened = false
    }

    if (canBeOpened) {
      e.preventDefault()
    }
  })
}

function getVideo(filename) {
  const fileUrl = `${API_ROOT}/public/${filename}`
  const videoEl = document.createElement('video')

  videoEl.style.visibility = 'visible'
  videoEl.src = fileUrl
  videoEl.type = "video/mp4"
  videoEl.controls = true
  videoEl.autoplay = true

  updatePreview(videoEl)
}

function getAudio(filename) {
  const fileUrl = `${API_ROOT}/public/${filename}`
  const audioEl = document.createElement('audio')

  audioEl.style.visibility = 'visible'
  audioEl.src = fileUrl
  audioEl.type = "audio/ogg"
  audioEl.autoplay = true
  audioEl.controls = true

  updatePreview(audioEl)
}

function updatePreview(previewEl) {
  const container = document.querySelector(`#${PREVIEW_CONTAINER_ID}`)
    ;[...container.children].forEach(child => child.remove())

  container.append(previewEl)
}

function apiFetch(url, method = 'GET', body) {
  const fullUrl = `${API_ROOT}${url}`
  if (body) {
    if (typeof (body) == 'string') {
      return fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: body
      })
    }
    else {
      return fetch(fullUrl, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: body
      })
    }
  }
  return fetch(fullUrl, {
    method,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  })
}

document.querySelector(`#span`).addEventListener('click', () => {
  document.querySelector(`#myModal`).style.display = "none"
})

window.onclick = function (event) {
  if (event.target == document.querySelector(`#myModal`)) {
    document.querySelector(`#myModal`).style.display = "none";
  }
}