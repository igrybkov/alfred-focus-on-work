'use strict'

const taskpaper = require('taskpaper')
const alfy = require('alfy')
const process = require('process')
const fs = require('fs')
const crypto = require('crypto')

let errorMessage
const filePath = process.env['taskpaper_file']

if (filePath === undefined) {
  errorMessage = 'TaskPaper file path is not set'
} else if (!fs.lstatSync(filePath).isFile()) {
  errorMessage = 'TaskPaper file does not exist'
}
if (errorMessage !== undefined) {
  alfy.output([{
    title: errorMessage,
    arg: '',
    valid: false,
    icon: {
      path: 'icons/taskpaper.png'
    }
  }])
}

class Task {
  constructor (title, tags, project) {
    this.title = title
    this.project = project
    this.tags = Array.isArray(tags) ? tags.map(this.deserializeTag) : []
    this.tagsLine = tags.join(', ')
    this.uid = crypto.createHash('sha256').update(title).digest('hex')

    this.matchLine = [this.title, this.project, this.tagsLine].filter((v) => v !== '').join(' ')
    this.subTitle = [this.project, this.tagsLine].filter((v) => v !== '').join(' | ')
  }

  deserializeTag (tag) {
    var deserialized = tag.replace(/^/, '')
    var returnTag = { 'name': deserialized }

    if (deserialized.match(/\(.+\)/)) {
      var parenIndex = deserialized.indexOf('(')

      returnTag.name = deserialized.substr(0, parenIndex)
      returnTag.value = deserialized.substr(parenIndex + 1, deserialized.length - parenIndex - 2)
    }

    return returnTag
  }

  canShowTask () {
    return !this.isDone() && this.isStarted() && this.isProperTime()
  }

  isDone () {
    return undefined !== this.tags.find(tag => tag.name.toLowerCase() === 'done')
  }

  isStarted () {
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

  isProperTime () {
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

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    throw err
  };

  data = data.replace(/\s+\n/g, '\n')
  const output = taskpaper(data)

  let tasks = []

  const collectTasks = (items, project) => {
    if (project === undefined) {
      project = ''
    }
    // console.log(items);
    for (const item of items) {
      if (item.type === 'task') {
        const task = new Task(item.value, item.tags, project)

        if (task.canShowTask()) {
          tasks.push({
            uid: task.uid,
            title: task.title,
            arg: task.title,
            match: task.matchLine,
            subtitle: task.subTitle,
            icon: {
              path: 'icons/taskpaper.png'
            },
            variables: {
              task: task.title,
              task_source: 'taskpaper'
            }
          })
        }
      }
      if (Array.isArray(item.children)) {
        const itemProject = item.type === 'project' ? item.value + (project !== '' ? ' <- ' + project : '') : project
        collectTasks(item.children, itemProject)
      }
    }
  }

  collectTasks(output.children)
  alfy.output(tasks)
})
