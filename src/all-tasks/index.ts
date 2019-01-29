'use strict';
// @flow
import { App, Registrator } from '../app';
import Application from '../app/application';
import { GetMainMenu } from '../events';

export default new Registrator((app: Application) => {
  app.on(GetMainMenu.name, addMainMenuItem, 500);
});

const addMainMenuItem = async (event: GetMainMenu) => {
  event.output.items.push({
    title: 'All tasks',
    subtitle: 'Show all tasks scheduled for today',
    arg: 'tasks',
    icon: {
      path: 'images/all-tasks.png',
    },
    variables: {
      taskManager: '',
    },
  });
};
