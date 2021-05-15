const API_ROOT = 'http://localhost:8082'

const PREVIEW_CONTAINER_ID = 'preview-container'

document.querySelector(`#upload`).addEventListener('submit', e => {
  e.preventDefault()

  let fileUpload = document.querySelector(`#fileUpload`).files[0]
  // let formData = new FormData()

  // formData.append("fileUpload", fileUpload)
  apiFetch('/upload', 'POST', fileUpload).then(res => {
    const p = document.createElement('p')
    p.innerText = res.statusText
    document.querySelector("#uploadStatus").appendChild(p)
  }).catch(res => {
    const p = document.createElement('p')
    p.innerText = 'Ah!'
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
      const a = document.createElement('a')
      appendSongs(filename, a)
      addEventSong(filename, a)
    })
  })
}

function appendSongs(filename, a) {
  const fileUrl = `${API_ROOT}/public/${filename}`

  a.href = fileUrl
  a.download = filename
  a.innerText = filename

  a.style.display = 'block'

  document.querySelector("#songs").appendChild(a)
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
  // for (child of container.children) {
  //   child.remove()
  // }

  container.append(previewEl)
}

function apiFetch(url, method = 'GET', body) {
  if (body) {
    return fetch(`${API_ROOT}${url}`, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: body
    })
  }
  return fetch(`${API_ROOT}${url}`, {
    method,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  })
}
