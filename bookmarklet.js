;(function() {
  const sm = window.soundManager
  const soundId = sm.soundIDs[0]

  if (!soundId) {
    alert('No sound found.')
    return
  }
  if (document.querySelector('.ext')) return

  const playBackward = -15
  const playForward = 15

  const microPlayer = document.querySelector('.micro-player')
  const container = document.createElement('li')
  const backwardButton = document.createElement('button')
  const forwardButton = document.createElement('button')
  const rateSlider = document.createElement('input')
  const commentsButton = document.createElement('button')
  const style = document.createElement('style')
  const keyMap = {
    ArrowUp: playForward,
    ArrowDown: playBackward
  }

  const timeToSec = (time) => {
    return time
      .split(':')
      .reverse()
      .reduce((acc, curr, i) => acc + Number(curr) * Math.pow(60, i), 0)
  }

  const setPosition = (sec) => {
    sm.setPosition(soundId, sm.getSoundById(soundId).position + sec * 1000)
  }
  const rateChange = (val) => {
    sm.setPlaybackRate(soundId, val)
  }
  const onKeydown = (e) => {
    const val = keyMap[e.key]
    if (!val) return
    setPosition(val)
  }
  const getComments = () => {
    return Array.prototype.slice
      .call(document.querySelectorAll('.comments:not(.reply) > li'))
      .reverse()
      .map((el, index) => {
        const commentBy = el.querySelector('.comment-by')
        const author = commentBy.querySelector('a').innerText
        const time = commentBy.innerText.replace(/^.*at ([\d:]+) .*$/, '$1')
        return {
          author,
          index,
          time,
          sec: timeToSec(time),
          comments: Array.prototype.slice
            .call(el.querySelectorAll('.comment-block p'))
            .map((c) => c.innerHTML.replace(/<a.*?href="(.*?)".*?\/a>/gi, '$1'))
        }
      })
      .sort((a, b) => (a.sec === b.sec ? a.index - b.index : a.sec - b.sec))
      .map((item) =>
        [`<!-- [${item.time}] ${item.author} -->`, ...item.comments.map((c) => `- ${c}`)].join('\n')
      )
      .join('\n\n')
  }
  const copyComments = () => {
    const comments = getComments()
    const tempForm = document.createElement('textarea')
    tempForm.textContent = comments
    document.body.appendChild(tempForm)
    tempForm.select()
    alert(
      'Export comments into clipboard. : ' + (document.execCommand('copy') ? 'Success' : 'Failure')
    )
    document.body.removeChild(tempForm)
  }

  // controls
  backwardButton.textContent = '<<'
  forwardButton.textContent = '>>'
  commentsButton.textContent = 'Export'
  rateSlider.type = 'range'
  rateSlider.min = 1
  rateSlider.max = 3
  rateSlider.value = 1
  rateSlider.step = 'any'
  rateSlider.style.width = '100px'

  container.className = 'ext'
  void [backwardButton, forwardButton, rateSlider, commentsButton].forEach((el) =>
    container.appendChild(el)
  )
  microPlayer.appendChild(container)

  // style
  style.innerHTML = `
  .ext {
    position: absolute;
    top: 10px;
    left: 100%;
    width: 100%;
  }
  .ext > * {
    display: inline-block !important;
  }
  `
  document.body.appendChild(style)

  // events
  backwardButton.addEventListener('click', () => setPosition(playBackward))
  forwardButton.addEventListener('click', () => setPosition(playForward))
  rateSlider.addEventListener('change', (e) => rateChange(e.target.value))
  commentsButton.addEventListener('click', copyComments)
  window.addEventListener('keydown', onKeydown)

  // Keep update commentPosition on plyaing
  new MutationObserver((mutations) => {
    document.querySelector('#write_comment').dataset.commentPosition = timeToSec(
      document.querySelector('.sm2_position').innerText
    )
  }).observe(document.querySelector('#sm2_timing'), { childList: true })
})()
