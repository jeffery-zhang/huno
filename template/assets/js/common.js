window.Alpine?.start()

function search(e) {
  console.log(e)
  const keywords = e.target.value
  if (!keywords) return
  console.log(keywords)
  const searchUrl = `${window.location.origin}/search?keywords=${keywords}`
  location.href = searchUrl
}

function toggleTheme() {
  console.log('toggle theme')
  const theme = document.documentElement.getAttribute('data-theme')
  if (theme === 'forest') {
    document.documentElement.setAttribute('data-theme', 'nord')
  } else {
    document.documentElement.setAttribute('data-theme', 'forest')
  }
}
