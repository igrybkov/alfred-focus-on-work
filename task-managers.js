'use strict'

const process = require('process')

const icons = {
  things: {
    path: 'icons/things3.png'
  },
  taskpaper: {
    path: 'icons/taskpaper.png'
  },
  default: {}
}

const items = []

const hasTaskInProgress = process.env['task'] !== undefined && process.env['task'].trim() !== ''

if (hasTaskInProgress) {
  const currentTask = process.env['task']
  const taskSource = process.env['task_source'] !== undefined ? process.env['task_source'] : 'default'
  const stopTaskItem = {
    title: 'Stop current work...',
    subtitle: currentTask,
    arg: 'stop',
    icon: icons[taskSource] !== undefined ? icons[taskSource] : {}
  }
  items.push(stopTaskItem)
}

if (!hasTaskInProgress && process.env['last_task'] !== undefined && process.env['last_task'].trim() !== '') {
  const lastTask = process.env['last_task']
  const lastTaskSource = process.env['last_task_source'] !== undefined ? process.env['last_task_source'] : 'default'
  const lastTaskItem = {
    title: `Continue work: "${lastTask}"`,
    subtitle: lastTask,
    arg: 'last_task',
    icon: icons[lastTaskSource] !== undefined ? icons[lastTaskSource] : {}
  }
  items.push(lastTaskItem)
}

items.push({
  title: 'Things',
  subtitle: "Today's tasks from Things",
  arg: 'things',
  icon: icons.things,
  mods: {
    alt: {
      valid: true,
      arg: 'open_things',
      subtitle: 'Open Things app'
    }
  }
})
items.push({
  title: 'TaskPaper',
  subtitle: "Today's tasks from TaskPaper",
  arg: 'taskpaper',
  icon: icons.taskpaper,
  mods: {
    alt: {
      valid: true,
      arg: 'open_taskpaper',
      subtitle: 'Open TaskPaper app'
    }
  }
})

const output = {
  items: items
}

console.log(JSON.stringify(output, null, '\t'))
