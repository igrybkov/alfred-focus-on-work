'use strict'

const applescript = require('applescript')
const alfy = require('alfy')

const unfocusScript = `do shell script "open focus://unfocus"`
const focusScript = `do shell script "open focus://focus?minutes=${alfy.input}"`

applescript.execString(unfocusScript, () => {})
applescript.execString(focusScript, () => {})
