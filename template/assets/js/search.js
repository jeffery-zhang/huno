function listenSearchInput() {
  const searchInput = document.getElementById('search')
  searchInput.addEventListener('keyup', (e) => {
    if (e.code && e.code.toLowerCase() === 'enter') {
      const value = e.target.value
      if (value) {
        window.location.href = `${window.location.protocol}//${window.location.host}/search?keyword=${value}`
      }
    }
  })
}
