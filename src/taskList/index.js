'use strict'

exports.getList = () => {
  const things = require('../things')
  const config = require('../config')
  const taskpaper = require('../taskpaper')
  const items = []

  const hasTaskInProgress = Boolean(config.get('task.in_progress.title'))

  const getIcon = source => {
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
        uuid: config.get('session.last_complete'),
        task: currentTask,
        // eslint-disable-next-line camelcase
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
      arg: 'last_task',
      variables: {
        task: lastTask,
        // eslint-disable-next-line camelcase
        task_source: lastTaskSource
      }
    }
    lastTaskItem.icon = getIcon(lastTaskSource)
    items.push(lastTaskItem)
  }

  items.push({
    title: 'All tasks',
    subtitle: `Today's tasks from Things`,
    arg: 'tasks',
    icon: {
      path: 'images/all-tasks.png'
    },
    variables: {
      taskmanager: 'all'
    }
  })

  items.push({
    title: 'Things',
    subtitle: `Today's tasks from Things`,
    arg: 'tasks',
    icon: things.getIcon(),
    mods: {
      alt: {
        valid: true,
        arg: 'open_things',
        subtitle: 'Open Things app'
      }
    },
    variables: {
      taskmanager: 'things'
    }
  })

  const taskPaperItem = {
    title: 'TaskPaper',
    subtitle: `Today's tasks from TaskPaper`,
    arg: 'tasks',
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
      taskmanager: 'taskpaper'
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
