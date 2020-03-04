/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'

;(function (self, Tetris) {
  typeof exports === 'object' && typeof module === 'object'
    ? module.exports = Tetris
    : self.Tetris = Tetris
}(typeof self !== 'undefined' ? self : this, (TetrisBoard => {
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
  const INITIAL_SPEED = 1000
  const SPEED_MULTIPLIER = 0.9995
  const LEVEL_DIVIDER = 25

  return class Tetris extends TetrisBoard {
    constructor () {
      super()

      this._speed = INITIAL_SPEED
      this._currentPiece = []
    }

    static get INSTRUCTIONS () {
      return {
        LEFT: 'left',
        DOWN: 'down',
        RIGHT: 'right',
        ROTATE: 'rotate',
        TIMER: 'timer',
      }
    }

    start () {
      this._addNewPiece()

      const timer = () => setTimeout(() => {
        if (this._lockGame)
          return
        this._timerCallback()
        this._timer = timer()
      }, this._speed)
      timer()
    }

    execInstruction (instruction) {
      switch (instruction) {
        case Tetris.INSTRUCTIONS.LEFT:
          this.movePieceLeft()
          break
        case Tetris.INSTRUCTIONS.DOWN:
          this.movePieceDown()
          break
        case Tetris.INSTRUCTIONS.RIGHT:
          this.movePieceRight()
          break
        case Tetris.INSTRUCTIONS.ROTATE:
          this.rotatePiece()
          break
        case Tetris.INSTRUCTIONS.TIMER:
          this._timerCallback()
          break
      }
    }

    _timerCallback () {
      this.movePieceDown()
      this._updateLevel()
    }

    _updateLevel () {
      this._speed *= SPEED_MULTIPLIER
      this._level = (INITIAL_SPEED - this._speed) / LEVEL_DIVIDER + 1
    }

    movePieceDown () {
      if (this._lockGame) return

      const addNewPiece = this._currentPiece.reduce((addNewPiece, block) => addNewPiece ||
        block.y === 0 ||
        (!!this.board[block.y - 1][block.x] && !this.board[block.y - 1][block.x].currentPiece)
      , false)

      if (addNewPiece) {
        const currentPieceRow = this._currentPiece.reduce((maxY, block) => Math.max(block.y, maxY), 0)
        if (currentPieceRow >= this.BOARD_SIZE.y - 2) {
          this._gameOver()
        } else {
          this._checkFullRows()
          this._addNewPiece()
        }
      } else {
        this._translateCurrentPiece(block => { block.y = block.y - 1 })
      }
    }

    movePieceLeft () { this._movePieceSide(Tetris.INSTRUCTIONS.LEFT) }

    movePieceRight () { this._movePieceSide(Tetris.INSTRUCTIONS.RIGHT) }

    _movePieceSide (side) {
      if (this._lockGame) return

      let xShift
      let hit
      if (side === Tetris.INSTRUCTIONS.RIGHT) {
        xShift = +1
        hit = this._currentPiece.reduce((hit, block) => hit ||
          block.x === this.BOARD_SIZE.x - 1 ||
          (!!this.board[block.y][block.x + xShift] && !this.board[block.y][block.x + xShift].currentPiece)
        , false)
      } else if (side === Tetris.INSTRUCTIONS.LEFT) {
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
      if (this._lockGame) return

      const piecePosition = this._currentPiece.reduce((pos, block) => ({
        x: Math.min(block.x, pos.x),
        y: Math.max(block.y, pos.y),
      }), {
        x: this.BOARD_SIZE.x,
        y: 0,
      })
      const rotatedPieceProperties = this._currentPiece.reduce((properties, block) => ({
        height: Math.max(properties.height, (block.x - piecePosition.x + 1)),
        width: Math.max(properties.width, (piecePosition.y - block.y + 1)),
      }), {
        height: 0,
        width: 0,
      })
      const xShift = Math.min(0, Math.max(-2, (this.BOARD_SIZE.x - 1) - (piecePosition.x + rotatedPieceProperties.width - 1))) // Move piece left if it hits the wall after rotation
      let xRelativeAlign = Math.floor(rotatedPieceProperties.height / 2 - 1)
      if (piecePosition.x + xRelativeAlign < 0) xRelativeAlign = 0
      const rotatedPiece = this._currentPiece.map(block => Object.assign({
        x: block.x,
        y: block.y,
      }, {
        x: piecePosition.y - block.y + piecePosition.x + xShift + xRelativeAlign,
        y: block.x - piecePosition.x + piecePosition.y - (rotatedPieceProperties.height - 1),
      }))
      const hit = rotatedPiece.reduce((hit, block) => hit ||
          block.y < 0 ||
          block.x < 0 ||
          block.x > this.BOARD_SIZE.x - 1 ||
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
      this._updateVisualBoard()
    }

    _checkFullRows () {
      const fullRowIndexes = []
      for (let y = 0; y < this.BOARD_SIZE.y; y++) {
        let fullRow = true
        for (let x = 0; x < this.BOARD_SIZE.x; x++)
          fullRow &= !!this.board[y][x]
        if (fullRow)
          fullRowIndexes.unshift(y)
      }
      fullRowIndexes.forEach(y => {
        this.board[y].forEach(this._deleteVisualBlock)
        this.board.splice(y, 1)
        this.board.push(new Array(this.BOARD_SIZE.x))
      })

      const multiplier = val => val < 1 ? 0 : val + multiplier(val - 1)
      this._score += multiplier(fullRowIndexes.length) * 100 * this._level
    }

    _addNewPiece () {
      const pieceType = this.nextPieceType || this._getRandomPieceType()

      this._currentPiece.forEach(block => { block.currentPiece = false })
      this._currentPiece = []
      this._nextPieceType = this._getRandomPieceType()

      const piece = PIECES[pieceType]
      const pieceWidth = piece[0].length
      const pieceHeight = piece.length
      const pieceOffset = Math.floor((this.BOARD_SIZE.x - pieceWidth) / 2)

      for (let y = 0; y < pieceHeight; y++) {
        for (let x = 0; x < pieceWidth; x++) {
          if (piece[y].charAt(x) !== ' ') {
            const blockX = pieceOffset + x
            const blockY = this.BOARD_SIZE.y - y - 1
            this.board[blockY][blockX] = this._generateBlock(pieceType, blockX, blockY)
          }
        }
      }

      this._updateVisualBoard()
    }

    _getRandomPieceType () {
      const pieceTypes = Object.keys(PIECES)
      return pieceTypes[Math.floor(Math.random() * pieceTypes.length)]
    }

    _gameOver () {
      this._lockGame = true
      clearTimeout(this._timer)
      super._gameOver()
    }
  }
})(typeof TetrisBoard !== 'undefined'
  ? TetrisBoard
  : require('./TetrisBoard'),
)))
