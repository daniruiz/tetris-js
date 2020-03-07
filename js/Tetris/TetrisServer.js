/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'
const fs = require('fs')
const Tetris = require('./Tetris')

module.exports = class TetrisServer extends Tetris {
  constructor (webSocket, scoreListFile) {
    super()

    this._scoreListFile = scoreListFile
    this._webSocket = webSocket
    this._webSocket.onmessage = ({ data }) => {
      const message = JSON.parse(data)
      if (message.instruction)
        this.execInstruction(message.instruction)
      if (message.saveScoreName)
        this._saveScore(message.saveScoreName)
    }
    this._webSocket.onclose = () => {
      if (!this._saved)
        this._saveScore()
      this._gameOver()
    }

    this._scoreList = JSON.parse(fs.readFileSync(this._scoreListFile))
    this._sendData({ scores: this._scoreList })
  }

  start () { this._addNewPiece() }

  _getRandomPieceType () {
    const nextPieceType = super._getRandomPieceType()
    this._sendData({ nextPieceType })
    return nextPieceType
  }

  _sendData (data) { this._webSocket.send(JSON.stringify(data)) }

  _saveScore (name = 'anonymous') {
    this._saved = true
    this._webSocket.close()

    if (this.score === 0)
      return

    name = name.substring(0, 10)
    for (var i = this._scoreList.length - 1; i >= 0; i--)
      if (this.score < this._scoreList[i].score)
        break
    this._scoreList.splice(i + 1, 0, {
      name,
      score: this.score,
    })
    fs.writeFileSync(this._scoreListFile, JSON.stringify(this._scoreList, null, 2))
  }
}
