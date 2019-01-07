'use strict'

const applescript = require('applescript')

const unfocusScript = `do shell script "open focus://unfocus"`

applescript.execString(unfocusScript, () => {})
