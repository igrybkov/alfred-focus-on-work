'use strict'

const crypto = require('crypto')
const config = require('../config')

const getIcon = () => {
  return {
    path: 'images/taskpaper.png'
  }
}

const CONFIG_FILE_PATH = 'taskpaper.file'

exports.getIcon = getIcon

exports.isFileSet = () => config.has(CONFIG_FILE_PATH)

const getFile = () => {
  let value = config.get(CONFIG_FILE_PATH)
  if (value !== undefined) {
    value = value.trim()
  }
  return value
}

class Task {
  constructor(title, tags, project) {
    this.title = title
    this.project = project
    this.tags = Array.isArray(tags) ? tags.map(this.deserializeTag) : []
    this.tagsLine = tags.join(', ')
    this.uid = crypto.createHash('sha256').update(title).digest('hex')

    this.matchLine = [this.title, this.project, this.tagsLine].filter(v => v !== '').join(' ')
    this.subTitle = [this.project, this.tagsLine].filter(v => v !== '').join(' | ')
  }

  deserializeTag(tag) {
    var deserialized = tag.replace(/^/, '')
    var returnTag = {name: deserialized}

    if (deserialized.match(/\(.+\)/)) {
      var parenIndex = deserialized.indexOf('(')

      returnTag.name = deserialized.substr(0, parenIndex)
      returnTag.value = deserialized.substr(parenIndex + 1, deserialized.length - parenIndex - 2)
    }

    return returnTag
  }

  canShowTask() {
    return !this.isDone() && this.isStarted() && this.isProperTime()
  }

  isDone() {
    return undefined !== this.tags.find(tag => tag.name.toLowerCase() === 'done')
  }

  isStarted() {
    return (tags => {
      for (const tag of tags) {
        if (tag.name.toLowerCase() === 'start' && tag.value !== undefined) {
          const tagDate = new Date(tag.value)
          return tagDate.getTime() <= new Date().getTime()
        }
      }
      return true
    })(this.tags)
  }

  isProperTime() {
    return (tags => {
      for (const tag of tags) {
        if (tag.name.toLowerCase() === 'today') {
          return true
        }
        if (tag.name.toLowerCase() === 'this-week') {
          return true
        }
        if (tag.name.toLowerCase() === 'due' && tag.value !== undefined) {
          const tagDate = new Date(tag.value)
          return tagDate.getTime() <= new Date().getTime()
        }
      }
      return false
    })(this.tags)
  }
}

const getTasks = async () => {
  const util = require('util')
  const taskpaper = require('taskpaper')
  const fs = require('fs')

  let errorMessage
  const filePath = getFile()

  if (filePath === undefined) {
    errorMessage = 'TaskPaper file path is not set'
  } else if (!fs.lstatSync(filePath.trim()).isFile()) {
    errorMessage = 'TaskPaper file does not exist'
  }
  if (errorMessage !== undefined) {
    return [
      {
        title: errorMessage,
        arg: '',
        valid: false,
        icon: getIcon()
      }
    ]
  }

  let readFile = util.promisify(fs.readFile)
  const rawFileData = await readFile(filePath.trim(), 'utf8')
  const output = taskpaper(rawFileData.replace(/\s+\n/g, '\n'))

  let tasks = []

  const collectTasks = (items, project) => {
    if (project === undefined) {
      project = ''
    }
    // console.log(items);
    for (const item of items) {
      if (item.type === 'task' || item.type === 'project') {
        const task = new Task(item.value, item.tags, project)

        if (task.canShowTask()) {
          tasks.push({
            uid: task.uid,
            title: task.title,
            arg: task.title,
            match: task.matchLine,
            subtitle: task.subTitle,
            icon: getIcon(),
            variables: {
              task: task.title,
              // eslint-disable-next-line camelcase
              task_source: 'taskpaper'
            }
          })
        }
      }
      if (Array.isArray(item.children)) {
        const itemProject = item.type === 'project' ? item.value + (project === '' ? '' : ' <- ' + project) : project
        collectTasks(item.children, itemProject)
      }
    }
  }

  collectTasks(output.children)

  return tasks
}

exports.getTasks = getTasks

/**
 * @todo now this function just opens TaskPaper, not today's view
 */
exports.openToday = async () => {
  const file = getFile()
  const script = `
tell application "TaskPaper"
  open "${file}"
  activate
end tell
`
  const fs = require('fs')
  const util = require('util')
  const applescript = require('applescript')

  if (!fs.lstatSync(file).isFile()) {
    throw new Error('TaskPaper file does not exist')
  }

  let ascript = util.promisify(applescript.execString)
  await ascript(script)
}
