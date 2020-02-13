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

    this._currentPiece = []

    this.board = new Array(BOARD_SIZE.y)
    for (let y = 0; y < BOARD_SIZE.y; y++)
        this.board[y] = new Array(BOARD_SIZE.x)

    this._addNewPiece()

    const timer = () => setTimeout(() => {
      this.movePieceDown()
      timer()
    }, 1000)
    timer()
  }

  movePieceDown () {
    let addNewPiece = this._currentPiece.reduce((addNewPiece, block) => 
      addNewPiece ||
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
      this._currentPiece.forEach(block => this.board[block.y][block.x] = null)
      this._currentPiece.forEach(block => {
        this.board[block.y - 1][block.x] = block
        block.y = block.y - 1
      })
      this._updateBoard()
    }
  }

  movePieceSide (side) {
    let xShift
    let hit
    let currentPiece
    if (side === 'right') {
      xShift = +1
      hit = this._currentPiece.reduce((hit, block) => 
        hit ||
        block.x === BOARD_SIZE.x - 1 ||
        (!!this.board[block.y][block.x + xShift] && !this.board[block.y][block.x + xShift].currentPiece)
      , false)
    } else if (side === 'left') {
      xShift = -1
      hit = this._currentPiece.reduce((hit, block) => 
        hit ||
        block.x === 0 ||
        (!!this.board[block.y][block.x + xShift] && !this.board[block.y][block.x + xShift].currentPiece)
      , false)
    }

    if (!hit) {
      this._currentPiece.forEach(block => this.board[block.y][block.x] = null)
      this._currentPiece.forEach(block => {
        this.board[block.y][block.x + xShift] = block
        block.x = block.x + xShift
      })
      this._updateBoard()
    }
  }

  rotatePiece () {
    const piecePos = this._currentPiece.reduce((pos, block) => ({ x: Math.max(block.y, pos.y), y: Math.min(block.x, pos.y) }), { x: 0, y: BOARD_SIZE.y })
    console.log(piecePos)
  }

  _gameOver () {
    console.log('GAME OVER')
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
}

/* ++++++++++++++++++++++ */
let tetris
window.onload = () => {
  tetris = new Tetris(document.getElementById('tetris'))
  document.addEventListener('keydown', event => {
    switch (event.keyCode) {
      case KEYS.UP:
        tetris.movePieceDown()
        break
      case KEYS.DOWN:
        tetris.movePieceDown()
        break
      case KEYS.LEFT:
        tetris.movePieceSide('left')
        break
      case KEYS.RIGHT:
        tetris.movePieceSide('right')
        break
      case KEYS.ACTION:
        tetris.rotatePiece()
        break
    }
  })
}

