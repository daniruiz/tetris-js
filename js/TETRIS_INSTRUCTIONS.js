/* eslint-disable comma-dangle */
/* eslint-disable curly */

'use strict'

!(function (self, TETRIS_INSTRUCTIONS) {
  typeof exports === 'object' && typeof module === 'object'
    ? module.exports = TETRIS_INSTRUCTIONS
    : self.TETRIS_INSTRUCTIONS = TETRIS_INSTRUCTIONS
}(typeof self !== 'undefined' ? self : this, {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
}))
