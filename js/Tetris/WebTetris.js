/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'

;(function (self, WebTetris) {
  self.WebTetris = WebTetris
}(typeof self !== 'undefined' ? self : this, class WebTetris extends Tetris {
  constructor (boardElement) {
    if (!(boardElement instanceof window.Element))
      throw new Error('You must pass a valid DOM element')

    super()

    this.boardElement = boardElement
    this.boardElement.classList.add('__tetris-container')
    this.boardElement.innerHTML = ''
    for (let i = 0; i < 4; i++)
      boardElement.appendChild(Object.assign(document.createElement('DIV'), { className: 'piece--next' }))
  }

  _addVisualBlock (block) {
    block.element = Object.assign(document.createElement('DIV'), { className: `piece--${block.type}` })
    this.boardElement.appendChild(block.element)
  }

  _deleteVisualBlock ({ element }, i) { setTimeout(() => element.remove(), i * 10) }

  _updateVisualBoard (block, x, y) {
    const BOARD_SIZE = this.BOARD_SIZE
    for (let y = 0; y < BOARD_SIZE.y; y++) {
      for (let x = 0; x < BOARD_SIZE.x; x++) {
        const block = this.board[y][x]
        if (block) {
          block.element.style.left = `${x * 100 / BOARD_SIZE.x}%`
          block.element.style.bottom = `${y * 100 / BOARD_SIZE.y}%`
        }
      }
    }
  }
}))
