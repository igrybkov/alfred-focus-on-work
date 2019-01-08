'use strict'

/**
 * Valid things requests on AppleScript
 * @see https://culturedcode.com/things/download/Things3AppleScriptGuide.pdf
 *
 * tell application "Things3" to get name of to dos of list "Today"
 * tell application "Things3" to get name of to dos of list "Today" whose tag names contains "Home"
 * tell application "Things3" to get name of to dos of list "Today" whose name contains "Book"
 * tell application "Things3" to get {name, id} of to dos of list "Today"
 * tell application "Things3" to get {name, id, name of project} of to dos of list "Today"
 * tell application "Things3" to get to dos of list "Today"
 * tell application "Things3" to get names of each to do of list "Today"
 */

const util = require('util')
const applescript = require('applescript')
const alfy = require('alfy')

const getIcon = () => {
  return {
    path: 'icons/things.png'
  }
}

exports.getIcon = getIcon

const getTasks = async () => {
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

  const tasks = []

  let result = []

  try {
    let ascript = util.promisify(applescript.execString)
    result = await ascript(script)
  } catch (err) {
    alfy.log(err)
    return [
      {
        title: 'There are no tasks found for ⭐️ Today',
        arg: '',
        valid: false,
        icon: {
          path: 'icons/things3.png'
        }
      }
    ]
  }

  if (Array.isArray(result)) {
    const items = []
    collectValues(result[0], 'title', items)
    collectValues(result[1], 'id', items)
    collectValues(result[2], 'tags', items)
    collectValues(result[3], 'projectName', items)
    collectValues(result[4], 'areaName', items)

    for (const item of items) {
      const project = item.projectName === 'missing value' ? '' : item.projectName
      const area = item.areaName === 'missing value' ? '' : item.areaName
      const tags = item.tags
      const title = item.title
      tasks.push({
        uid: item.id,
        title: title,
        arg: title,
        match: [title, project, area, tags].filter(v => v !== '').join(' '),
        subtitle: [project, area, tags].filter(v => v !== '').join(' | '),
        icon: getIcon(),
        variables: {
          task: title,
          // eslint-disable-next-line camelcase
          task_source: 'things'
        }
      })
    }
  }
  return tasks
}

exports.getTasks = getTasks

exports.openToday = async () => {
  const script = `
tell application "Things3"
  show list "Today"
  activate
end tell
`

  try {
    let ascript = util.promisify(applescript.execString)
    await ascript(script)
  } catch (err) {
    alfy.log(err)
  }
}
