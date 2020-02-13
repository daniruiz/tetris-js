/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'

const BOARD_SIZE = {
  x: 10,
  y: 22,
}
const PIECES = {
  I: [
    '0000',
  ],
  O: [
    '00',
    '00',
  ],
  T: [
    '000',
    ' 0 ',
  ],
  J: [
    '000',
    '  0',
  ],
  L: [
    '000',
    '0  ',
  ],
  S: [
    ' 00',
    '00 ',
  ],
  Z: [
    '00 ',
    ' 00',
  ],
}
const KEYS = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  ACTION: 17,
}

class Tetris {
  constructor (boardElement) {
    if (!(boardElement instanceof window.Element)) return

    this.boardElement = boardElement
    this.boardElement.classList.add('__tetris-container')

    this._speed = 1000
    this._currentPiece = []

    this.board = new Array(BOARD_SIZE.y)
    for (let y = 0; y < BOARD_SIZE.y; y++)
      this.board[y] = new Array(BOARD_SIZE.x)

    this._addNewPiece()

    const timer = () => {
      this._timer = setTimeout(() => {
        this.movePieceDown()
        timer()
      }, this._speed)
    }
    timer()
  }

  set onGameOver (callback) {
    if (typeof callback !== 'function') return
    this._gameOverCallback = callback
  }

  movePieceDown () {
    this._speed *= 0.999

    const addNewPiece = this._currentPiece.reduce((addNewPiece, block) => addNewPiece ||
      block.y === 0 ||
      (!!this.board[block.y - 1][block.x] && !this.board[block.y - 1][block.x].currentPiece)
    , false)

    if (addNewPiece) {
      const currentPieceRow = this._currentPiece.reduce((maxY, block) => Math.max(block.y, maxY), 0)
      if (currentPieceRow >= BOARD_SIZE.y - 3)
        this._gameOver()
      else
        this._addNewPiece()
    } else {
      this._translateCurrentPiece(block => { block.y = block.y - 1 })
    }
  }

  movePieceLeft () { this._movePieceSide('left') }

  movePieceRight () { this._movePieceSide('right') }

  _movePieceSide (side) {
    let xShift
    let hit
    if (side === 'right') {
      xShift = +1
      hit = this._currentPiece.reduce((hit, block) => hit ||
        block.x === BOARD_SIZE.x - 1 ||
        (!!this.board[block.y][block.x + xShift] && !this.board[block.y][block.x + xShift].currentPiece)
      , false)
    } else if (side === 'left') {
      xShift = -1
      hit = this._currentPiece.reduce((hit, block) => hit ||
        block.x === 0 ||
        (!!this.board[block.y][block.x + xShift] && !this.board[block.y][block.x + xShift].currentPiece)
      , false)
    }

    if (!hit)
      this._translateCurrentPiece(block => { block.x = block.x + xShift })
  }

  rotatePiece () {
    const piecePosition = this._currentPiece.reduce((pos, block) => ({
      x: Math.min(block.x, pos.x),
      y: Math.max(block.y, pos.y),
    }), {
      x: BOARD_SIZE.x,
      y: 0,
    })
    const rotatedPieceProperties = this._currentPiece.reduce((properties, block) => ({
      height: Math.max(properties.height, (block.x - piecePosition.x + 1)),
      width: Math.max(properties.width, (piecePosition.y - block.y + 1)),
    }), {
      height: 0,
      width: 0,
    })
    const xShift = Math.min(0, Math.max(-2, (BOARD_SIZE.x - 1) - (piecePosition.x + rotatedPieceProperties.width - 1))) // Move piece left if it hits the wall after rotation
    const rotatedPiece = this._currentPiece.map(block => Object.assign({
      x: block.x,
      y: block.y,
    }, {
      x: piecePosition.y - block.y + piecePosition.x + xShift + Math.floor(rotatedPieceProperties.height / 2 - 1),
      y: block.x - piecePosition.x + piecePosition.y - (rotatedPieceProperties.height - 1),
    }))
    const hit = rotatedPiece.reduce((hit, block) => hit ||
        block.y < 0 ||
        block.x < 0 ||
        block.x > BOARD_SIZE.x - 1 ||
        (!!this.board[block.y][block.x] && !this.board[block.y][block.x].currentPiece)
    , false)

    if (!hit) {
      this._translateCurrentPiece((block, i) => {
        Object.assign(block, rotatedPiece[i])
        this.board[block.y][block.x] = block
      })
    }
  }

  _translateCurrentPiece (callback) {
    this._currentPiece.forEach(block => { this.board[block.y][block.x] = null })
    this._currentPiece.forEach((block, i) => {
      callback(block, i)
      this.board[block.y][block.x] = block
    })
    this._updateBoard()
  }

  _addNewPiece () {
    this._currentPiece.forEach(block => { block.currentPiece = false })
    this._currentPiece = []

    const pieceKeys = Object.keys(PIECES)
    const pieceNumber = Math.floor(Math.random() * pieceKeys.length)
    const pieceType = pieceKeys[pieceNumber]
    const piece = PIECES[pieceType]
    const pieceWidth = piece[0].length
    const pieceHeight = piece.length
    const pieceOffset = Math.floor((BOARD_SIZE.x - pieceWidth) / 2)

    for (let y = 0; y < pieceHeight; y++) {
      for (let x = 0; x < pieceWidth; x++) {
        if (piece[y].charAt(x) !== ' ') {
          const blockX = pieceOffset + x
          const blockY = BOARD_SIZE.y - y - 1
          this.board[blockY][blockX] = this._generateBlock(pieceType, blockX, blockY)
        }
      }
    }

    this._updateBoard()
  }

  _generateBlock (type, x, y) {
    const block = {
      element: Object.assign(document.createElement('DIV'), { className: `piece--${type}` }),
      currentPiece: true,
      x,
      y,
    }
    this._currentPiece.push(block)
    this.boardElement.appendChild(block.element)
    return block
  }

  _updateBoard () {
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

  _gameOver () {
    clearTimeout(this._timer)
    if (this._gameOverCallback)
      this._gameOverCallback()
  }
}

/* ++++++++++++++++++++++ */
let tetris
window.onload = () => {
  tetris = new Tetris(document.getElementById('tetris'))
  tetris.onGameOver = () => console.log('GAME OVER')
  document.addEventListener('keydown', event => {
    switch (event.keyCode) {
      case KEYS.UP:
        tetris.movePieceDown()
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
      case KEYS.ACTION:
        tetris.rotatePiece()
        break
    }
  })
}

