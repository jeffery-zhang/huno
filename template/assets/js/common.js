function init() {
  const ele = document.getElementById('restCategories')
  ele.addEventListener('mouseenter', showRestList)
  ele.addEventListener('mouseleave', hideRestList)
}

function showRestList() {
  const ele = document.getElementById('restCategoriesList')
  ele.style.opacity = 1
}

function hideRestList() {
  const ele = document.getElementById('restCategoriesList')
  ele.style.opacity = 0
}

window.addEventListener('load', init)
