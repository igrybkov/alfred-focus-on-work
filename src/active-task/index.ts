'use strict';
// @flow
import { App, Registrator } from '../app';
import Application from '../app/application';
import { GetMainMenu, StartWorkOnTask, StopWorkOnTask } from '../events';

export default new Registrator((app: Application) => {
  app.on(GetMainMenu.name, addStopTaskMenuItem, 30);
  app.on(StartWorkOnTask.name, saveTask);
  app.on(StopWorkOnTask.name, stopPropagationIfTaskChanged, 20);
  app.on(StopWorkOnTask.name, removeTask);
});

const CONF_KEY = 'active_task';

const addStopTaskMenuItem = async (event: GetMainMenu, app: Application) => {
  const activeTask = app.config.get(CONF_KEY);
  if (typeof activeTask !== 'object' || !Object.keys(activeTask).length) {
    return;
  }

  const stopTaskItem = {
    title: `${activeTask.title}`,
    subtitle: 'Stop work on the task',
    uid: activeTask.uid,
    arg: 'stop-work',
    match: [activeTask.title, 'stop work'].join(' '),
    variables: {
      taskUid: activeTask.uid,
      taskTitle: activeTask.title,
      taskManager: activeTask.taskManager,
      sessionUuid: activeTask.sessionUuid,
    },
    icon: {
      path: 'images/stop-sign.png',
    },
  };

  event.output.items.unshift(stopTaskItem);
};

async function saveTask(event: StartWorkOnTask, app: Application) {
  console.log('aaa');
  let activeTask = app.config.get(CONF_KEY);
  if (!activeTask) {
    activeTask = {};
  }

  activeTask.title = event.taskTitle;
  activeTask.taskManager = event.taskManager;
  activeTask.uid = event.taskUid;
  activeTask.sessionUuid = event.sessionUuid;

  app.config.set(CONF_KEY, activeTask);
}

async function stopPropagationIfTaskChanged(
  event: StopWorkOnTask,
  app: Application,
) {
  const activeTask = app.config.get(CONF_KEY);
  if (!activeTask) {
    return;
  }
  if (
    activeTask.sessionUuid &&
    event.sessionUuid &&
    activeTask.sessionUuid !== event.sessionUuid
  ) {
    event.stopPropagation();
  }
}

async function removeTask(event: StopWorkOnTask, app: Application) {
  let activeTask = app.config.get(CONF_KEY);
  if (!activeTask) {
    return;
  }
  activeTask = {};
  app.config.set(CONF_KEY, activeTask);
}
