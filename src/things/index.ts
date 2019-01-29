import Application from '../app/application';

import { AlfredItemsSet } from '../alfred';
import { Registrator } from '../app/registrator';
import { GetMainMenu, GetTasks, OpenApp, ResolveTaskItem } from '../events';

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

import { execString } from 'applescript';

const APP_NAME = 'Things3';
const APP_IDENTIFIER = 'things3';
import { promisify } from 'util';

let cachedTasks: AlfredItemsSet|undefined;

export default new Registrator(async (app: Application) => {
  if (!(await app.hasApp(APP_NAME))) {
    return;
  }
  app.on(GetMainMenu.name, addMainMenuItem, 100);
  app.on(GetTasks.name, addThingsTasks, 100);
  app.on(ResolveTaskItem.name, resolveItem);
  app.on(OpenApp.name, openThings);
});

const resolveItem = async (event: ResolveTaskItem) => {
  if (event.taskManager !== APP_IDENTIFIER) {
    return;
  }
  for (const task of await getTasks()) {
    if (task.uid === event.taskUid) {
      event.item = task;
      return;
    }
  }
};

const addThingsTasks = async (event: GetTasks) => {
  if (event.app && event.app !== APP_IDENTIFIER) {
    return;
  }
  for (const task of await getTasks()) {
    event.output.items.push(task);
  }
};

const addMainMenuItem = async (event: GetMainMenu) => {
  event.output.items.push({
    title: 'Things',
    subtitle: "Today's tasks from Things",
    arg: 'tasks',
    icon: getIcon(),
    mods: {
      cmd: {
        valid: true,
        arg: 'open-app',
        subtitle: 'Open Things app',
        variables: {
          action: 'today',
          application: APP_IDENTIFIER,
        },
      },
    },
    variables: {
      taskmanager: APP_IDENTIFIER,
    },
  });
};

const getIcon = () => {
  return {
    path: 'images/things.png',
  };
};

const getTasks = async (): Promise<AlfredItemsSet> => {
  if (cachedTasks !== undefined) {
    return cachedTasks;
  }

  const script =
    'tell application "Things3"' +
    ' to get {name, id, tag names, name of project, name of area} ' +
    'of to dos of list "Today"';

  const collectValues = (values: any, key: any, items: any[]) => {
    let i = 0;
    for (const value of values) {
      if (items[i] === undefined) {
        items[i] = {};
      }
      items[i][key] = value;
      i++;
    }
  };

  const tasks: AlfredItemsSet = [];

  let result = [];

  try {
    const ascript = promisify(execString);
    result = (await ascript(script)) as any[];
  } catch (err) {
    // Todo: log error in debug mode
    return [
      {
        title: 'There are no tasks found for ⭐️ Today',
        arg: '',
        valid: false,
        icon: getIcon(),
      },
    ];
  }

  if (Array.isArray(result)) {
    const items: any[] = [];
    collectValues(result[0], 'title', items);
    collectValues(result[1], 'id', items);
    collectValues(result[2], 'tags', items);
    collectValues(result[3], 'projectName', items);
    collectValues(result[4], 'areaName', items);

    for (const item of items) {
      const project =
        item.projectName === 'missing value' ? '' : item.projectName;
      const area = item.areaName === 'missing value' ? '' : item.areaName;
      const tags = item.tags;
      const title = item.title;
      tasks.push({
        uid: item.id,
        title,
        arg: title,
        match: [title, project, area, tags].filter((v) => v !== '').join(' '),
        subtitle: [project, area, tags].filter((v) => v !== '').join(' | '),
        icon: getIcon(),
        variables: {
          taskTitle: title,
          taskManager: APP_IDENTIFIER,
          taskUid: item.id,
        },
      });
    }
  }
  cachedTasks = tasks;
  return tasks;
};

export const openThings = async (event: OpenApp) => {
  if (event.appName !== APP_IDENTIFIER) {
    return;
  }
  if (event.action !== 'today') {
    throw new Error('Unsopperted action passed');
  }
  const script = `
tell application "Things3"
  show list "Today"
  activate
end tell
`;

  // try {
  const ascript = promisify(execString);
  await ascript(script);
  // } catch (err) {
  // todo: log error in debug mode
  // }
};
