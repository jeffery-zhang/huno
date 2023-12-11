function listenSearchInput() {
  const searchInput = document.getElementById('search')
  searchInput.addEventListener('keyup', (e) => {
    if (e.code.toLowerCase() === 'enter') {
      const value = e.target.value
      if (value) {
        window.location.href = `${window.location.protocol}//${window.location.host}/search?keyword=${value}`
      }
    }
  })
}

function importStyle() {
  var styles = document.createElement('link')
  styles.type = 'text/css'
  styles.rel = 'stylesheet'
  styles.href = `${window.location.protocol}//${window.location.host}/assets/css/index.css`
  document.getElementsByTagName('head')[0].appendChild(styles)
}

async function getContentList() {
  const pathname = window.location.pathname
  if (!pathname.includes('search')) return
  const searchParams = new URLSearchParams(window.location.search)
  const keyword = searchParams.get('keyword')
  if (!keyword) return
  importStyle()
  const xmlText = await (
    await fetch(
      `${window.location.protocol}//${window.location.host}/contentMap.xml`,
    )
  ).text()

  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')

  const contentList = Array.from(doc.querySelectorAll('content'))
    .filter((content) => {
      const title = content
        .querySelector('page')
        .querySelector('title').textContent
      return title.toLowerCase().includes(keyword.toLowerCase())
    })
    .map((content) => {
      const pageParams = content.querySelector('page')
      return {
        baseUrl: content.querySelector('baseUrl').textContent,
        page: {
          title: pageParams.querySelector('title').textContent,
          description: pageParams.querySelector('description').textContent,
          url: pageParams.querySelector('url').textContent,
          updateTime: pageParams.querySelector('updateTime').textContent,
        },
      }
    })

  const listDomString = contentList
    .map((config) => renderListItem(config))
    .join('')
  const containerDomString = `<div class="list" id="searchList">
    ${listDomString}
  </div>`

  const main = document.getElementById('main')
  main.innerHTML = containerDomString
}

function renderListItem(config) {
  const pageParams = config.page
  return `<article class="entry">
    <a href="${config.baseUrl}${pageParams.url}" class="link"></a>
    <header>
      <h2>${pageParams.title}</h2>
    </header>
    <div class="entry-content">
      <p>${pageParams.description}</p>
    </div>
    <footer>
      <span>${pageParams.updateTime}</span>
    </footer>
  </article>`
}

window.addEventListener('load', listenSearchInput)
window.addEventListener('load', getContentList)
