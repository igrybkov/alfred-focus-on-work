'use strict'

const applescript = require('applescript')
const alfy = require('alfy')

const script = `tell application "Things3"` +
  ` to get {name, id, tag names, name of project, name of area} ` +
  `of to dos of list "Today"`

const collectValues = (values, key, items) => {
  let i = 0
  for (const value of values) {
    if (items[i] === undefined) {
      items[i] = {}
    }
    items[i][key] = value
    i++
  }
}

applescript.execString(script, (err, rtn) => {
  if (err) {
    alfy.output([{
      title: 'There are no tasks found for ⭐️ Today',
      arg: '',
      valid: false,
      icon: {
        path: 'icons/things3.png'
      }
    }])
    return
  }
  let items = []
  if (Array.isArray(rtn)) {
    const tasks = []
    collectValues(rtn[0], 'title', tasks)
    collectValues(rtn[1], 'id', tasks)
    collectValues(rtn[2], 'tags', tasks)
    collectValues(rtn[3], 'projectName', tasks)
    collectValues(rtn[4], 'areaName', tasks)

    for (const task of tasks) {
      const project = task.projectName === 'missing value' ? '' : task.projectName
      const area = task.areaName === 'missing value' ? '' : task.areaName
      const tags = task.tags
      const title = task.title
      items.push({
        uid: task.id,
        title: title,
        arg: title,
        match: [title, project, area, tags].filter((v) => v !== '').join(' '),
        subtitle: [project, area, tags].filter((v) => v !== '').join(' | '),
        icon: {
          path: 'icons/things3.png'
        },
        variables: {
          task: title,
          task_source: 'things'
        }
      })
      items = alfy.inputMatches(items, 'title')
    }
  }
  alfy.output(items)
})
