/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'
const WebSocket = require('ws')
const fs = require('fs')
const TetrisServer = require('./Tetris/TetrisServer')

const scoreListFile = '../score-list.json'

process.on('uncaughtException', function (err) {
  console.error('Caught exception: ', err)
})

const webSocketServer = new WebSocket.Server({ port: 8080 })
webSocketServer.on('connection', webSocket => {
  new TetrisServer(webSocket, scoreListFile)
})
