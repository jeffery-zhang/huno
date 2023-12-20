window.Alpine?.start()

function search(e) {
  const keywords = e.target.value
  if (!keywords) return
  const searchUrl = `${window.location.origin}/search?keywords=${keywords}`
  location.href = searchUrl
}

function getCurrentTheme() {
  const theme = localStorage.getItem('theme') ?? 'nord'
  console.log('current theme: ', theme)
  return theme
}

function toggleTheme() {
  const current = localStorage.getItem('theme') ?? 'nord'
  let nextTheme
  if (current === 'nord') nextTheme = 'forest'
  else nextTheme = 'nord'
  localStorage.setItem('theme', nextTheme)
  setTheme(nextTheme)
}

function setTheme(theme) {
  if (!theme) theme = getCurrentTheme()
  document.body.setAttribute('data-theme', theme)
}

async function findSearchList() {
  const isSearchPage = location.pathname.includes('search')
  if (!isSearchPage) return
  const qs = localStorage.search
  const params = new URLSearchParams(qs)
  const keywords = params.get('keywords')
  const xml = await (await fetch('/contentMap.xml')).text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml)
  const contents = xmlDoc.querySelectorAll('content')
  const filtered = Array.from(contents).filter(
    (doc) =>
      doc.querySelector('title')?.includes(keywords) ||
      doc.querySelector('description')?.includes(keywords),
  )
}

window.addEventListener('load', findSearchList)
