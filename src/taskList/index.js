'use strict'

exports.getList = () => {
  const things = require('../things')
  const config = require('../config')
  const taskpaper = require('../taskpaper')
  const items = []

  const hasTaskInProgress = !!config.get('task.in_progress.title')

  const getIcon = (source) => {
    if (source === 'things') {
      return things.getIcon()
    } else if (source === 'taskpaper') {
      return taskpaper.getIcon()
    }
    return {}
  }

  if (hasTaskInProgress) {
    const currentTask = config.get('task.in_progress.title')
    const taskSource = config.get('task.in_progress.source')
    const stopTaskItem = {
      title: 'Stop current work...',
      subtitle: currentTask,
      arg: 'stop',
      variables: {
        task: currentTask,
        task_source: taskSource
      }
    }
    stopTaskItem.icon = getIcon(taskSource)

    items.push(stopTaskItem)
  }

  if (!hasTaskInProgress && config.get('task.last.title')) {
    const lastTask = config.get('task.last.title')
    const lastTaskSource = config.get('task.last.source')
    const lastTaskItem = {
      title: `Continue work: "${lastTask}"`,
      subtitle: lastTask,
      arg: 'last_task'
    }
    lastTaskItem.icon = getIcon(lastTaskSource)
    items.push(lastTaskItem)
  }

  items.push({
    title: 'Things',
    subtitle: "Today's tasks from Things",
    arg: 'things',
    icon: things.getIcon(),
    mods: {
      alt: {
        valid: true,
        arg: 'open_things',
        subtitle: 'Open Things app'
      }
    },
    variables: {
      task_source: 'things'
    }
  })

  const taskPaperItem = {
    title: 'TaskPaper',
    subtitle: "Today's tasks from TaskPaper",
    arg: 'taskpaper',
    icon: taskpaper.getIcon(),
    mods: {
      alt: {
        valid: true,
        arg: 'open_taskpaper',
        subtitle: 'Open TaskPaper app'
      },
      cmd: {
        valid: true,
        arg: 'taskpaper_set_file',
        subtitle: 'Choose TaskPaper file'
      }
    },
    variables: {
      task_source: 'taskpaper'
    }
  }
  // In case config file is not set
  if (!taskpaper.isFileSet()) {
    taskPaperItem.mods = {}
    taskPaperItem.subtitle = 'You need to configure TaskPaper integration'
    taskPaperItem.arg = 'taskpaper_set_file'
  }

  items.push(taskPaperItem)

  return items
}
