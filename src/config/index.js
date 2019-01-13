'use strict'

const alfy = require('alfy')

const conf = alfy.config

exports.get = (name, defaultValue) => {
  return conf.get(name, defaultValue)
}

exports.has = name => {
  return conf.has(name)
}

exports.set = (name, value) => {
  conf.set(name, value)
}

exports.remove = name => {
  conf.delete(name)
}
