#!/usr/bin/env node
var plist = require('simple-plist')

const file = 'info.plist'

var data = plist.readFileSync(file)

data.variables = {
  taskpaper_file: ''
}

data.variablesdontexport = ['taskpaper_file']
plist.writeFileSync(file, data)
