'use strict'

const plist = require('simple-plist')

const file = 'settings.plist'

let data = null

const getData = () => {
  if (data === null) {
    try {
      data = plist.readFileSync(file)
    } catch (err) {
      data = {}
    }
  }
  return data
}

exports.get = (name) => {
  if (name === undefined) {
    throw new Error('Name must be set')
  }
  const data = getData()
  return data[name]
}

exports.has = (name) => {
  if (name === undefined) {
    throw new Error('Name must be set')
  }
  const data = getData()
  return data[name] !== undefined
}

exports.set = (name, value) => {
  let newData = getData()
  newData[name] = value
  data = newData
  plist.writeFileSync(file, data)
}

exports.remove = (name) => {
  let newData = getData()
  delete newData[name]
  data = newData
  plist.writeFileSync(file, data)
}
