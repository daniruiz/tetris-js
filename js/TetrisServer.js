/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'
const WebSocket = require('ws')
const fs = require('fs')
const Tetris = require('./Tetris')

const sourceListFile = '../score-list.json'

class TetrisServer extends Tetris {
  constructor (webSocket) {
    super()

    this._webSocket = webSocket
    this._webSocket.onmessage = ({ data }) => {
      const message = JSON.parse(data)
      if (message.instruction)
        this.execInstruction(message.instruction)
      if (message.saveScoreName)
        this._saveScore(message.saveScoreName)
    }
    this._webSocket.onclose = ({ code }) => {
      if (code === 1001 && !this._saved)
        this._saveScore('anonymous')
      this._gameOver()
    }

    this._scoreList = JSON.parse(fs.readFileSync(sourceListFile))
    this._sendData({ scores: this._scoreList })

    this.start()
  }

  _timerCallback () {
    this._sendData({ instruction: 'timer' })
    super._timerCallback()
  }

  _getRandomPieceType () {
    const nextPieceType = super._getRandomPieceType()
    this._sendData({ nextPieceType })
    return nextPieceType
  }

  _sendData (data) { this._webSocket.send(JSON.stringify(data)) }

  _saveScore (name) {
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
    fs.writeFileSync(sourceListFile, JSON.stringify(this._scoreList, null, 2))
  }
}

process.on('uncaughtException', function (err) {
  console.error('Caught exception: ', err)
})

const webSocketServer = new WebSocket.Server({ port: 8080 })
webSocketServer.on('connection', webSocket => {
  new TetrisServer(webSocket)
})
