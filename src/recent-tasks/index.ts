'use strict';

import { Application, Registrator } from '../app';
import { GetMainMenu, ResolveTaskItem, StartWorkOnTask } from '../events';

// @flow

const TASKS_KEY = 'recent_tasks';
const CONF_TASKS_NUMBER = 'settings.recent_tasks.count';

const DEFAULT_RECENT_TASKS = 3;

export default new Registrator((app: Application) => {
  app.on(GetMainMenu.name, addRecentTasksToMenu, 50);
  app.on(StartWorkOnTask.name, saveTask);
});

async function addRecentTasksToMenu(event: GetMainMenu, app: Application) {
  const tasks = app.config.get(TASKS_KEY);

  if (!tasks) {
    return;
  }

  for (const task of tasks) {
    const resolveTaskEvent = new ResolveTaskItem(
      task.title,
      task.taskManager,
      task.uid,
    );
    await app.dispatch(resolveTaskEvent);
    if (resolveTaskEvent.item) {
      const item = resolveTaskEvent.item;
      let hasItemInMenu = false;
      for (const menuItem of event.output.items) {
        if (menuItem.uid === item.uid) {
          hasItemInMenu = true;
          break;
        }
      }
      if (!hasItemInMenu) {
        item.arg = 'recent-task';
        event.output.items.push(item);
      }
    }
  }
}

interface RecentTask {
  title: string;
  taskManager: string;
  uid?: string;
}

async function saveTask(event: StartWorkOnTask, app: Application) {
  let tasks: RecentTask[] = app.config.get(TASKS_KEY);
  if (!Array.isArray(tasks)) {
    tasks = [];
  }
  tasks.unshift({
    taskManager: event.taskManager,
    title: event.taskTitle,
    uid: event.taskUid,
  });

  // Save only unique tasks in the list
  tasks = [...new Set(tasks.map((task) => JSON.stringify(task)))].map((taskJson) =>
    JSON.parse(taskJson),
  );

  tasks = tasks.slice(
    0,
    app.config.get(CONF_TASKS_NUMBER) || DEFAULT_RECENT_TASKS,
  );
  app.config.set(TASKS_KEY, tasks);
}
