'use strict'

const config = require('../config')

const getIcon = () => {
  return {
    path: 'icons/github.png'
  }
}

const CONFIG_TOKEN = 'github.token'

exports.getIcon = getIcon

const getTasks = async () => {
  return []
}

exports.getTasks = getTasks
