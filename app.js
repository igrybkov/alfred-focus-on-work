#!/usr/bin/env node
'use strict'

var program = require('commander')
const alfy = require('alfy')
const timing = require('./src/timing')
const things = require('./src/things')

/**
 * Override Alfy's output function to always pass uuid in the output
 */
alfy.output = arr => {
  const uuidv4 = require('uuid/v4')
  const output = {
    variables: {
      uuid: process.env.uuid || uuidv4()
    },
    items: arr
  }
  console.log(JSON.stringify(output, null, '\t'))
}

program
  .version('0.1.0')

program.command('timing:start')
  .description('Start Timing')
  .action(async () => {
    const task = process.env.task
    const time = process.env.time
    if (!(task && time)) {
      console.error('Invalid runtime: task and time environment variables could not be empty.')
      process.exit(1)
    }
    timing.start(task, time)
  })

program.command('timing:stop')
  .description('Stop Timing')
  .action(async () => {
    timing.stop()
  })

program.command('open:things:today')
  .description(`Open Today's tasks in Things`)
  .action(async () => {
    things.openToday()
  })

program.command('open:taskpaper:today')
  .description(`Open Today's tasks in TaskPaper`)
  .action(async () => {
    try {
      const taskpaper = require('./src/taskpaper')
      taskpaper.openToday()
    } catch (err) {
      alfy.error(err)
    }
  })

program.command('tasks:list')
  .arguments('[app]')
  .description('Show list of tasks from selected app (all by default)')
  .action(async app => {
    app = app || process.env.taskmanager || 'all'

    const providers = {
      things: async () => {
        return things.getTasks()
      },
      taskpaper: async () => {
        const taskpaper = require('./src/taskpaper')
        return taskpaper.getTasks()
      }
    }

    let items = []

    if (app === 'all') {
      for (const provider of Object.values(providers)) {
        const tasks = await provider()
        items = items.concat(tasks)
      }
    } else if (providers[app] === undefined) {
      throw new Error(`Tasks manager is not supported: ${app}`)
    } else {
      const provider = providers[app]
      items = await provider()
    }

    alfy.output(items)
  })

program.command('focus:start')
  .description('Start Focus')
  .action(async () => {
    const focus = require('./src/focus')
    const time = process.env.time
    if (!time) {
      console.error('Invalid runtime: time environment variable must be set.')
      process.exit(1)
    }
    focus.start(time)
  })

program.command('focus:stop')
  .description('Stop Focus')
  .action(async () => {
    const focus = require('./src/focus')
    focus.stop()
  })

program.command('config:set')
  .description('Set configuration option')
  .arguments('<name> <value>')
  .action(async (name, value) => {
    const config = require('./src/config')
    config.set(name, value.replace(/^\s+|\s+$/g, ''))
    alfy.log('config:set')
  })

program.command('menu:tasklist')
  .description('Show menu with list of available task managers')
  .action(async () => {
    const taskList = require('./src/taskList')
    alfy.output(taskList.getList())
  })

program.command('menu:time')
  .description('Show menu with list of time ranges')
  .action(async () => {
    const taskList = require('./src/timeList')
    alfy.output(taskList.getList())
  })

program.command('scenario:work:start')
  .description('Start work scenario')
  .action(async () => {
    const config = require('./src/config')
    const task = process.env.task
    const source = process.env.task_source
    const time = process.env.time
    const focus = require('./src/focus')

    // start the tools
    timing.start(task, time)
    focus.start(time)
    // save current task to configuration
    config.set('task.in_progress.title', task)
    config.set('task.in_progress.source', source)
    // save current session uuid
    config.set('session.last_complete', process.env.uuid)
  })

program.command('scenario:work:stop')
  .description('Stop work scenario')
  .action(async () => {
    const config = require('./src/config')
    const uuid = process.env.uuid
    const focus = require('./src/focus')
    const lastSessionUuid = config.get('session.last_complete')

    // exit if the uuid is changed - this session expired
    if (lastSessionUuid !== uuid) {
      process.exit(1)
    }

    // we still working on the same task as in the variable

    // save current task for suggestion on the next run
    config.set('task.last.title', config.get('task.in_progress.title'))
    config.set('task.last.source', config.get('task.in_progress.source'))

    // stop tools
    timing.stop()
    focus.stop()

    // remove the task from config
    config.remove('task.in_progress.title')
    config.remove('task.in_progress.source')
  })

// error on unknown commands
program.on('command:*', async () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

/**
 * Sort commands in the help
 */
program.commands.sort((a, b) => a._name.localeCompare(b._name))

/**
 * Print help if no arguments passed
 */
if (process.argv.slice(2).length === 0) {
  program.help()
}

program.parse(process.argv)
