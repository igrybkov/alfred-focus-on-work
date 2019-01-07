'use strict'

const applescript = require('applescript')
const script = `tell application "TimingHelper" to stop current task`
applescript.execString(script, () => {})
