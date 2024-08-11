/* eslint-disable comma-dangle */
/* eslint-disable curly */

const KEYS = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
}

let tetris
window.onload = () => {
  const tetrisContainer = document.getElementById('tetris')
  const configureTetris = tetris => {
    tetris.onGameOver = () => { document.getElementById('game-over').style.display = 'block' }
    tetris.onInfoChange = info => {
      document.querySelectorAll('[class^="piece--next"]')
        .forEach(element => { element.className = `piece--next--${info.nextPieceType}` })
      document.getElementsByClassName('__tetris-container')[0]
        .dataset.infoText = `Level ${info.level}  ::  Score ${info.score}`
    }
    return tetris
  }
  tetris = configureTetris(new WebTetris(tetrisContainer))
  tetris.start()

  document.getElementById('save-score-form').onsubmit = ({ target }) => {
    tetris.saveScore(target.querySelector('input[type=text]').value)
  }

  document.getElementById('show-scores').onclick = () => {
    tetris.stop()
    document.body.innerHTML = Object.assign(document.createElement('DIV'), {
      id: 'scores',
      innerHTML: tetris.scores.reduce((code, { name, score }, i) => {
        const nameElement = Object.assign(document.createElement('SPAN'))
        nameElement.innerText = `${i + 1}. ${name}`
        return code + `<div><span>${nameElement.outerHTML}</span><span>${score}</span></div>`
      }, '<span class="blinker">&lt;</span> <a href=".">RETURN</a><p>▓▓▒▒░░ SCORES ░░▒▒▓▓</p>')
    }).outerHTML
  }

  const addButtonPressEvent = (element, action) => {
    const keyPress = (target, action) => {
      action()
      navigator.vibrate(20)

      let interval
      const timeout = setTimeout(() => {
        document.getElementById('tetris').classList.add('key-press')
        interval = setInterval(() => action(), 50)
      }, 250)
      target.onmouseup = target.ontouchend = () => {
        document.getElementById('tetris').classList.remove('key-press')
        clearInterval(interval)
        clearTimeout(timeout)
        target.onmouseup = target.ontouchend = null
      }
    }
    element.ontouchstart = element.onmousedown = event => {
      event.preventDefault()
      keyPress(event.target, action)
    }
  }
  addButtonPressEvent(document.getElementsByClassName('control--left')[0], () => tetris.movePieceLeft())
  addButtonPressEvent(document.getElementsByClassName('control--right')[0], () => tetris.movePieceRight())
  addButtonPressEvent(document.getElementsByClassName('control--down')[0], () => tetris.movePieceDown())
  addButtonPressEvent(document.getElementsByClassName('control--action')[0], () => tetris.rotatePiece())
  document.getElementsByClassName('control--up')[0].onmouseup = () => tetris.pushPiece()

  document.onkeydown = event => {
    switch (event.keyCode) {
      case KEYS.UP:
        tetris.rotatePiece()
        break
      case KEYS.DOWN:
        tetris.movePieceDown()
        break
      case KEYS.LEFT:
        tetris.movePieceLeft()
        break
      case KEYS.RIGHT:
        tetris.movePieceRight()
        break
      case KEYS.SPACE:
        tetris.pushPiece()
        break
    }
  }
}
