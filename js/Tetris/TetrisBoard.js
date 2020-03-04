/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'

;(function (self, TetrisBoard) {
  typeof exports === 'object' && typeof module === 'object'
    ? module.exports = TetrisBoard
    : self.TetrisBoard = TetrisBoard
}(typeof self !== 'undefined' ? self : this, (() => {
  const BOARD_SIZE = {
    x: 10,
    y: 22,
  }

  return class TetrisBoard {
    constructor () {
      this.board = new Array(this.BOARD_SIZE.y)
      for (let y = 0; y < this.BOARD_SIZE.y; y++)
        this.board[y] = new Array(this.BOARD_SIZE.x)

      this.__score = 0
      this.__level = 0
    }

    get BOARD_SIZE () { return BOARD_SIZE }

    get level () { return Math.floor(this._level) }

    get _level () { return this.__level }

    set _level (level) {
      const previousLevel = this.level
      this.__level = level
      if (previousLevel !== this.level)
        this._updateInfo()
    }

    get score () { return this._score }

    get _score () { return Math.floor(this.__score) }

    set _score (score) {
      if (score === this.__score)
        return
      this.__score = score
      this._updateInfo()
    }

    get nextPieceType () { return this.__nextPieceType }

    set _nextPieceType (type) {
      this.__nextPieceType = type
      this._updateInfo()
    }

    set onGameOver (callback) {
      if (typeof callback !== 'function')
        return
      this._gameOverCallback = callback
    }

    set onInfoChange (callback) {
      if (typeof callback !== 'function')
        return
      this._infoChangeCallback = callback
    }

    _updateInfo () {
      if (this._infoChangeCallback) {
        this._infoChangeCallback({
          level: this.level,
          score: this.score,
          nextPieceType: this.nextPieceType
        })
      }
    }

    _generateBlock (type, x, y) {
      const block = {
        currentPiece: true,
        type,
        x,
        y,
      }
      this._addVisualBlock(block)
      this._currentPiece.push(block)
      return block
    }

    _addVisualBlock (block) {}

    _deleteVisualBlock (block, i) {}

    _updateVisualBoard () {}

    _gameOver () {
      if (this._gameOverCallback)
        this._gameOverCallback()
    }
  }
})()))
