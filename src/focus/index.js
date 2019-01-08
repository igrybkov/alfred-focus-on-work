'use strict'

const applescript = require('applescript')
const alfy = require('alfy')
const util = require('util')

exports.start = async (timeInMinutes) => {
  const unfocusScript = `do shell script "open focus://unfocus"`
  const focusScript = `do shell script "open focus://focus?minutes=${timeInMinutes}"`

  let ascript = util.promisify(applescript.execString)
  await ascript(unfocusScript)

  ascript = util.promisify(applescript.execString)
  await ascript(focusScript)

  alfy.log(`Focus started for ${timeInMinutes}`)
}

exports.stop = () => {
  const unfocusScript = `do shell script "open focus://unfocus"`

  applescript.execString(unfocusScript, () => { })
  alfy.log(`Focus stopped`)
}
