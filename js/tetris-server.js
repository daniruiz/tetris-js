/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'
const WebSocket = require('ws')
const TetrisServer = require('./Tetris/TetrisServer')

const [PORT] = process.argv.slice(2)
const SCORELIST_FILE = '../score-list.json'

process.on('uncaughtException', function (err) {
  console.error('Caught exception: ', err)
})

const webSocketServer = new WebSocket.Server({ port: PORT })
webSocketServer.on('connection', webSocket => {
  const tetrisServer = new TetrisServer(webSocket, SCORELIST_FILE)
  tetrisServer.start()
})
