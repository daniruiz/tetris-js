/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'

;(function (self, WebTetrisClient) {
  self.WebTetrisClient = WebTetrisClient
}(typeof self !== 'undefined' ? self : this, class WebTetrisClient extends WebTetris {
  constructor (boardElement, url) {
    if (!(boardElement instanceof window.Element))
      throw new Error('You must pass a valid DOM element')

    super(boardElement)

    this._lockMessages = false

    let playing = false

    this._webSocket = new WebSocket(url)
    this._webSocket.onerror = e => this._error(e)
    this._webSocket.onmessage = ({ data }) => {
      const message = JSON.parse(data)
      if (message.scores)
        this.scores = message.scores
      if (message.instruction)
        this.execInstruction(message.instruction)
      if (message.nextPieceType) {
        this._nextPieceType = message.nextPieceType
        if (!playing) {
          playing = true
          this.start()
        }
      }
    }
  }

  set onError (callback) {
    if (typeof callback !== 'function')
      return
    this._onErroCallback = callback
  }

  stop () { this._webSocket.close() }

  _timerCallback () {
    this._sendData({ instruction: 'timer' })
    this._lockMessages = true
    super._timerCallback()
    this._lockMessages = false
  }

  // Disable this function as the next piece is provided by the server with some delay
  _getRandomPieceType () { return this.nextPieceType }

  movePieceDown () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.DOWN })
    super.movePieceDown()
  }

  movePieceLeft () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.LEFT })
    super.movePieceLeft()
  }

  movePieceRight () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.RIGHT })
    super.movePieceRight()
  }

  rotatePiece () {
    this._sendData({ instruction: Tetris.INSTRUCTIONS.ROTATE })
    super.rotatePiece()
  }

  saveScore (name) {
    if (this.score !== 0)
      this._sendData({ saveScoreName: name })
  }

  _sendData (data) {
    if (!this._lockMessages)
      this._webSocket.send(JSON.stringify(data))
  }

  _error (e) {
    if (this._onErroCallback)
      this._onErroCallback(e)
    else
      console.error(e)
  }
}))
