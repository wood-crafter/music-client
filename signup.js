const API_ROOT = 'http://localhost:8082'

document.querySelector(`#signup`).addEventListener('submit', (e) => {
  e.preventDefault()
  const username = document.querySelector(`#username`).value
  const password = document.querySelector(`#password`).value
  const body = { username: username, password: password }

  fetch(`${API_ROOT}/signup`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (res.ok) {
        res.text().then(token => {
          localStorage.setItem('token', token)
          window.location = '/index.html'
        })
        return
      }

      const p = document.createElement('p')
      p.innerText = 'User name existed'
      document.querySelector(`#password`).value = ''
      document.querySelector("#signupFailed").appendChild(p)
    })
})
