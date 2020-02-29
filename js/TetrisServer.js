/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'
const WebSocket = require('ws')
const Tetris = require('./Tetris')

class TetrisServer extends Tetris {
  constructor (webSocket) {
    super()
    this._webSocket = webSocket
    this._webSocket.onmessage = ({ data }) => {
      const message = JSON.parse(data)
      if (message.instruction)
        this.execInstruction(message.instruction)
    }
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
}

const webSocketServer = new WebSocket.Server({ port: 8080 })
webSocketServer.on('connection', webSocket => {
  new TetrisServer(webSocket)
})
