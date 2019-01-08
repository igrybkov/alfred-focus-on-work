#!/usr/bin/env node
'use strict'

var program = require('commander')
const timing = require('./src/timing')
const things = require('./src/things')
const alfy = require('alfy')

program
  .version('0.1.0')

program.command('timing:start')
  .description('Start Timing')
  .action(async () => {
    const task = process.env['task']
    const time = process.env['time']
    if (!(task && time)) {
      console.error('Invalid runtime: task and time environment variables could not be empty.')
      process.exit(1)
    }
    timing.start(task, time)
  })

program.command('timing:stop')
  .description('Stop Timing')
  .action(async () => {
    alfy.log('Timing:stop called')
    timing.stop()
  })

program.command('open:things:today')
  .description(`Open Today's tasks in Things`)
  .action(async () => {
    things.openToday()
    alfy.log('things:open')
  })

program.command('tasks:things')
  .description('Show list of tasks from Things')
  .action(async () => {
    const tasks = await things.getTasks()
    alfy.output(tasks)
    alfy.log('things:tasks')
  })

program.command('open:taskpaper:today')
  .description('Start Timing')
  .action(async () => {
    try {
      const taskpaper = require('./src/taskpaper')
      taskpaper.openToday()
    } catch (err) {
      alfy.error(err)
    }
    alfy.log('open:taskpaper:today')
  })

program.command('tasks:taskpaper')
  .description('Start Timing')
  .action(async () => {
    const taskpaper = require('./src/taskpaper')
    const tasks = await taskpaper.getTasks()
    alfy.output(tasks)
    alfy.log('tasks:taskpaper')
  })

program.command('focus:start')
  .description('Start Focus')
  .action(async () => {
    const focus = require('./src/focus')
    const time = process.env['time']
    if (!time) {
      console.error('Invalid runtime: time environment variable must be set.')
      process.exit(1)
    }
    focus.start(time)
    alfy.log('focus:start')
  })

program.command('focus:stop')
  .description('Stop Focus')
  .action(async () => {
    const focus = require('./src/focus')
    focus.stop()
    alfy.log('focus:stop')
  })

program.command('config:set')
  .description('Set configuration option')
  .arguments('<name> <value>')
  .action(async (name, value) => {
    const config = require('./src/config')
    config.set(name, value)
    alfy.log('config:set')
  })

program.command('menu:tasklist')
  .description('Start Timing')
  .action(async () => {
    const taskList = require('./src/taskList')
    alfy.output(taskList.getList())
    // alfy.log('Tasklist showed')
  })

program.command('scenario:work:start')
  .description('Start work scenario')
  .action(async () => {
    const config = require('./src/config')
    const task = process.env['task']
    const source = process.env['task_source']
    const time = process.env['time']
    const focus = require('./src/focus')

    // start the tools
    timing.start(task, time)
    focus.start(time)
    // save current task to configuration
    config.set('task.in_progress.title', task)
    config.set('task.in_progress.source', source)
  })

program.command('scenario:work:stop')
  .description('Stop work scenario')
  .action(async () => {
    const config = require('./src/config')
    const task = process.env['task']
    const focus = require('./src/focus')
    const currentTask = config.get('task.in_progress.title')

    // exit if the task is changed - this session expired
    if (currentTask !== task) {
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
if (!process.argv.slice(2).length) {
  program.help()
}

program.parse(process.argv)
