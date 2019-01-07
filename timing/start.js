'use strict'

const applescript = require('applescript')
const alfy = require('alfy')
const process = require('process')

const task = alfy.input
const time = 60 * (process.env['time'] !== undefined ? process.env['time'] : 45)

const script = `tell application "TimingHelper" to start task with title "${task}" for about ${time}`

applescript.execString(script, () => {})
