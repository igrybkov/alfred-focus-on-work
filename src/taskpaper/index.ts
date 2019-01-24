'use strict';

import { Registrator } from '../app';
import Application from '../app/application';

// @flow
import { createHash } from 'crypto';
import { AlfredItemsSet } from '../alfred';
import { GetMainMenu, GetTasks } from '../events';

const APP_IDENTIFIER = 'taskpaper';
const APP_NAME = 'TaskPaper';

export default new Registrator((app: Application) => {
  if (!app.hasApp(APP_NAME)) {
    return;
  }
  app.on(GetMainMenu.name, addMainMenuItem, 200);
  app.on(GetTasks.name, addTaskpaperTasks, 200);
});

const addTaskpaperTasks = async (event: GetTasks, app: Application) => {
  if (event.app && event.app !== APP_IDENTIFIER) {
    return;
  }
  for (const task of await getTasks(app)) {
    event.output.items.push(task);
  }
};

const addMainMenuItem = async (event: GetMainMenu, app: Application) => {
  const taskPaperItem = {
    title: 'TaskPaper',
    subtitle: "Today's tasks from TaskPaper",
    arg: 'tasks',
    icon: getIcon(),
    mods: {
      alt: {
        valid: true,
        arg: 'open-app',
        subtitle: 'Choose TaskPaper file',
      },
      cmd: {
        valid: true,
        arg: 'taskpaper_set_file',
        subtitle: 'Open TaskPaper app',
        variables: {
          application: APP_IDENTIFIER,
          action: 'today',
        },
      },
    },
    variables: {
      taskmanager: APP_IDENTIFIER,
    },
  };
  // In case config file is not set
  if (!isFileSet(app)) {
    delete taskPaperItem.mods;
    taskPaperItem.subtitle = 'You need to configure TaskPaper integration';
    taskPaperItem.arg = 'taskpaper_set_file';
  }

  event.output.items.push(taskPaperItem);
};

const getIcon = () => {
  return {
    path: 'images/taskpaper.png',
  };
};

const CONFIG_FILE_PATH = 'settings.taskpaper.file';

const isFileSet = (app: Application) => app.config.has(CONFIG_FILE_PATH);

const getFile = (app: Application) => {
  let value = app.config.get(CONFIG_FILE_PATH);
  if (value !== undefined) {
    value = value.trim();
  }
  return value;
};

class Task {
  public title: any;
  public project: any;
  public tags: Array<{ name: any; value?: string }>;
  public tagsLine: any;
  public uid: string;
  public matchLine: string;
  public subTitle: string;
  constructor(title: string, tags: [] = [], project: string) {
    this.title = title;
    this.project = project;
    this.tags = Array.isArray(tags) ? tags.map(this.deserializeTag) : [];
    this.tagsLine = tags.join(', ');
    this.uid = createHash('sha256')
      .update(title)
      .digest('hex');

    this.matchLine = [this.title, this.project, this.tagsLine]
      .filter((v) => v !== '')
      .join(' ');
    this.subTitle = [this.project, this.tagsLine]
      .filter((v) => v !== '')
      .join(' | ');
  }

  public deserializeTag(tag: string) {
    const deserialized = tag.replace(/^/, '');
    const returnTag: { name: string; value?: string } = { name: deserialized };

    if (deserialized.match(/\(.+\)/)) {
      const parenIndex = deserialized.indexOf('(');

      returnTag.name = deserialized.substr(0, parenIndex);
      returnTag.value = deserialized.substr(
        parenIndex + 1,
        deserialized.length - parenIndex - 2,
      );
    }

    return returnTag;
  }

  public canShowTask() {
    return !this.isDone() && this.isStarted() && this.isProperTime();
  }

  public isDone() {
    return (
      undefined !== this.tags.find((tag) => tag.name.toLowerCase() === 'done')
    );
  }

  public isStarted() {
    return ((tags) => {
      for (const tag of tags) {
        if (tag.name.toLowerCase() === 'start' && tag.value !== undefined) {
          const tagDate = new Date(tag.value);
          return tagDate.getTime() <= new Date().getTime();
        }
      }
      return true;
    })(this.tags);
  }

  public isProperTime() {
    return ((tags) => {
      for (const tag of tags) {
        if (tag.name.toLowerCase() === 'today') {
          return true;
        }
        if (tag.name.toLowerCase() === 'this-week') {
          return true;
        }
        if (tag.name.toLowerCase() === 'due' && tag.value !== undefined) {
          const tagDate = new Date(tag.value);
          return tagDate.getTime() <= new Date().getTime();
        }
      }
      return false;
    })(this.tags);
  }
}

const getTasks = async (app: Application) => {
  const util = require('util');
  const taskpaper = require('taskpaper');
  const fs = require('fs');

  let errorMessage;
  const filePath = getFile(app);

  if (filePath === undefined) {
    errorMessage = 'TaskPaper file path is not set';
  } else if (!fs.lstatSync(filePath.trim()).isFile()) {
    errorMessage = 'TaskPaper file does not exist';
  }
  if (errorMessage !== undefined) {
    return [
      {
        title: errorMessage,
        arg: '',
        valid: false,
        icon: getIcon(),
      },
    ];
  }

  const readFile = util.promisify(fs.readFile);
  const rawFileData = await readFile(filePath.trim(), 'utf8');
  const output = taskpaper(rawFileData.replace(/\s+\n/g, '\n'));

  const tasks: AlfredItemsSet = [];

  const collectTasks = (items: any[], project = '') => {
    if (project === undefined) {
      project = '';
    }
    for (const item of items) {
      if (item.type === 'task' || item.type === 'project') {
        const task = new Task(item.value, item.tags, project);

        if (task.canShowTask()) {
          tasks.push({
            uid: task.uid,
            arg: task.title,
            title: task.title,
            match: task.matchLine,
            subtitle: task.subTitle,
            icon: getIcon(),
            variables: {
              taskManager: APP_IDENTIFIER,
              taskTitle: task.title,
              taskUid: task.uid,
            },
          });
        }
      }
      if (Array.isArray(item.children)) {
        const itemProject = item.value.trim().replace(/^-+|-+$/g, '');
        const projectBreadcrumbs =
          item.type === 'project'
            ? itemProject + (project === '' ? '' : ` <- ${project}`)
            : project;
        collectTasks(item.children, projectBreadcrumbs);
      }
    }
  };

  collectTasks(output.children);

  return tasks;
};

const openToday = async (app: Application) => {
  const file = getFile(app);
  const script = `
tell application "TaskPaper"
  open "${file}"
  activate
end tell
`;
  const fs = require('fs');
  const util = require('util');
  const applescript = require('applescript');

  if (!fs.lstatSync(file).isFile()) {
    throw new Error('TaskPaper file does not exist');
  }

  const ascript = util.promisify(applescript.execString);
  await ascript(script);
};
