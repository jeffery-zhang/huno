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
  const qs = location.search
  const params = new URLSearchParams(qs)
  const keywords = params.get('keywords')?.toLowerCase()
  const inputEle = document.getElementById('searchInput')
  inputEle.setAttribute('value', keywords)
  const xml = await (await fetch('/contentMap.xml')).text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xml, 'text/xml')
  const contents = xmlDoc.querySelectorAll('content')
  const filtered = Array.from(contents)
    .filter(
      (doc) =>
        doc
          .querySelector('title')
          ?.textContent?.toLowerCase()
          ?.includes(keywords) ||
        doc
          .querySelector('description')
          ?.textContent?.toLowerCase()
          ?.includes(keywords),
    )
    .map((doc) => getObjectFromXmlDoc(doc))

  generateSearchList(filtered)
}

function getObjectFromXmlDoc(doc) {
  const obj = {}
  const keys = [
    'baseUrl',
    'title',
    'description',
    'url',
    'author',
    'category',
    'updateTime',
  ]
  keys.forEach((key) => {
    obj[key] = doc.querySelector(key)?.textContent
  })

  return obj
}

function generateSearchList(data) {
  data.forEach((item) => {
    const html = generateSingleListItem(item)
    const list = document.getElementById('articleList')
    list.insertAdjacentHTML('beforeend', html)
  })
}

function generateSingleListItem(item) {
  return `<li class="relative card w-full bg-base-100 shadow-xl mb-10">
  <div class="card-body">
    <div class="stat">
      <div class="stat-title">${item.author}</div>
      <h2
        class="stat-value cursor-pointer hover:text-primary transition-colors my-2 flex items-center gap-2"
      >
        <a href="${item.baseUrl}${item.url}">${item.title}</a>        
      </h2>
      <span class="stat-desc">Updated at ${item.updateTime}</span>
    </div>
    <p>${item.description}</p>
    <div>
      <span class="badge badge-lg badge-neutral">${item.category}</span>
    </div>
    <div class="card-actions justify-end">
      <a href="${item.baseUrl}${item.url}" class="btn btn-sm btn-primary"> >>> </a>
    </div>
  </div>
</li>
`
}

window.addEventListener('load', findSearchList)
