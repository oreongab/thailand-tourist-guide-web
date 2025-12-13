document.addEventListener('DOMContentLoaded', function () {
  var fav = document.querySelector('.place-detail-fav')
  var back = document.querySelector('.place-detail-back')

  if (fav) {
    fav.addEventListener('click', function () {
      if (fav.classList.contains('is-active')) {
        fav.classList.remove('is-active')
      } else {
        fav.classList.add('is-active')
      }

      var icon = fav.querySelector('.material-icons')
      if (!icon) return

      if (fav.classList.contains('is-active')) {
        icon.textContent = 'favorite'
      } else {
        icon.textContent = 'favorite_border'
      }
    })
  }

  if (back) {
    back.addEventListener('click', function () {
      history.back()
    })
  }
})