'use strict'

const applescript = require('applescript')
const alfy = require('alfy')

const DEFAULT_TIME = 25

exports.start = (task, timeInMinutes) => {
  const time = 60 * (timeInMinutes === undefined ? DEFAULT_TIME : timeInMinutes)
  const script = `tell application "TimingHelper" to start task with title "${task}" for about ${time}`
  applescript.execString(script, () => { })
  alfy.log('Timing task started: ' + task)
}

exports.stop = () => {
  const applescript = require('applescript')
  const script = `tell application "TimingHelper" to stop current task`
  alfy.log('Timing task stopped')
  applescript.execString(script, () => { })
}
