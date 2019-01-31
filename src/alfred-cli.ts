#!/usr/bin/env node

import { v4 as uuidv4 } from 'uuid';
import { App, Application, Registrator, requireArgument } from './app';

import { modules } from './modules';

import program = require('commander');

import {
  AddConfigurationValueToSet,
  GetMainMenu,
  GetTasks,
  GetTimeMenu,
  OpenApp,
  RemoveConfigurationValue,
  RemoveConfigurationValueFromSet,
  RenderOutput,
  SetConfigurationValue,
  ShowSettingOptions,
  ShowSettingsItems,
  StartWorkOnTask,
  StopWorkOnTask,
} from './events/index.js';

const version =
  process.env.alfred_workflow_version || process.env.npm_package_version;
if (version !== undefined) {
  program.version(version);
}

let quiet = false;
let filter = '';

/**
 * Filter output
 */
App.on(
  RenderOutput.name,
  async (event: RenderOutput, app: Application) => {
    if (filter) {
      event.output.items = App.filter(filter, event.output.items);
    }
  },
  5000,
);

App.on(
  RenderOutput.name,
  async (event: RenderOutput, app: Application) => {
    if (quiet) {
      return;
    }
    const output = event.output;
    if (!output.variables.uuid) {
      output.variables.sessionUuid = process.env.sessionUuid || uuidv4();
    }
    // tslint:disable-next-line:no-null-keyword
    console.log(JSON.stringify(output, null, '  '));
  },
  10000,
);

const commands = [
  async () => {
    program.option('-q, --quiet', 'Do not print regular output');
    program.on('option:quiet', () => {
      quiet = true;
    });
  },
  async () => {
    program.option('--filter <filter>', 'Filter output by passed string');
    program.on('option:filter', (filterStr) => {
      filter = filterStr;
    });
  },
  async () => {
    program
      .command('menu:main')
      .description('Show main menu with list of available task managers')
      .action(async () => {
        const event = new GetMainMenu();
        await App.done(App.dispatch(event));
      });
  },
  async () => {
    program
      .command('menu:tasks')
      .arguments('[appName]')
      .description('Show list of tasks from selected app (all by default)')
      .action(async (appName) => {
        appName = appName || process.env.taskmanager || undefined;
        await App.done(App.dispatch(new GetTasks(appName)));
      });
  },
  async () => {
    program
      .command('menu:time')
      .description('Show menu with list of time ranges')
      .action(async () => {
        const event = new GetTimeMenu();
        await App.done(App.dispatch(event));
      });
  },
  async () => {
    program
      .command('scenario:work:start')
      .description('Start work scenario')
      .arguments('[taskTitle] [taskManager] [timeInMinutes] [taskUid]')
      .action(
        async (
          taskTitle?: string,
          taskManager?: string,
          timeInMinutes?: number,
          taskUid?: string,
        ) => {
          const title = requireArgument(
            'Task title is required',
            taskTitle,
            process.env.taskTitle,
          );
          const manager = requireArgument(
            'Task manager is required',
            taskManager,
            process.env.taskManager,
          );
          const time = requireArgument(
            'Time is required',
            timeInMinutes,
            process.env.timeInMinutes,
          );
          const uuid = taskUid || process.env.taskUid || undefined;
          const event = new StartWorkOnTask(title, manager, time, uuid);
          await App.done(App.dispatch(event));
        },
      );
  },
  async () => {
    program
      .command('scenario:work:stop')
      .description('Stop work scenario')
      .arguments('[sessionUuid]')
      .action(async (sessionUuid) => {
        sessionUuid = requireArgument(
          'Session UUID is required',
          sessionUuid,
          process.env.sessionUuid,
        );
        const event = new StopWorkOnTask(sessionUuid);
        await App.done(App.dispatch(event));
      });
  },
  async () => {
    program
      .command('config:path')
      .description('Get path to configuration file')
      .action(async () => {
        console.log(App.config.path);
      });
  },
  async () => {
    program
      .command('menu:settings')
      .description('Show menu with list of settings')
      .action(async () => {
        const event = new ShowSettingsItems();
        await App.done(App.dispatch(event));
      });
  },
  async () => {
    program
      .command('menu:setting-options')
      .description('Get path to configuration file')
      .arguments('[setting-path]')
      .action(async (settingPath) => {
        const configPath: string = requireArgument(
          'Setting path is required',
          settingPath,
          process.env.settingPath,
        );
        const event = new ShowSettingOptions(configPath);
        await App.done(App.dispatch(event));
      });
  },
  async () => {
    program
      .command('settings:set')
      .description('Set configuration option')
      .arguments('[settingPath] [settingValue]')
      .action(async (settingPath, settingValue) => {
        settingPath = requireArgument(
          'Setting path is required',
          settingPath,
          process.env.settingPath,
        );
        settingValue = requireArgument(
          'Setting value is required',
          settingValue,
          process.env.settingValue,
        );
        const event = new SetConfigurationValue(settingPath, settingValue);
        await App.dispatch(event);
      });
  },
  async () => {
    program
      .command('settings:add')
      .description('Add configuration option to a set in the path')
      .arguments('[settingPath] [settingValue]')
      .action(async (settingPath, settingValue) => {
        settingPath = requireArgument(
          'Setting path is required',
          settingPath,
          process.env.settingPath,
        );
        settingValue = requireArgument(
          'Setting value is required',
          settingValue,
          process.env.settingValue,
        );
        const event = new AddConfigurationValueToSet(settingPath, settingValue);
        await App.dispatch(event);
      });
  },
  async () => {
    program
      .command('settings:remove')
      .description('Remove configuration option')
      .arguments('[settingPath>')
      .action(async (settingPath) => {
        settingPath = requireArgument(
          'Setting path is required',
          settingPath,
          process.env.settingPath,
        );
        const event = new RemoveConfigurationValue(settingPath);
        await App.dispatch(event);
      });
  },
  async () => {
    program
      .command('settings:remove-from-set')
      .description('Remove configuration option')
      .arguments('[settingPath] [settingKey>')
      .action(async (settingPath, settingKey) => {
        settingPath = requireArgument(
          'Setting path is required',
          settingPath,
          process.env.settingPath,
        );
        settingKey = requireArgument(
          'Setting value is required',
          settingKey,
          process.env.settingKey,
        );
        const event = new RemoveConfigurationValueFromSet(
          settingPath,
          settingKey,
        );
        await App.dispatch(event);
      });
  },
  async () => {
    program
      .command('open:app')
      .description('Open action in the application')
      .arguments('[application] [action]')
      .action(async (application: string, action: string) => {
        application = requireArgument(
          'Application name is required',
          application,
          process.env.application,
        );
        action = requireArgument(
          'Action is required',
          action,
          process.env.action,
        );
        const event = new OpenApp(application, action);
        await App.done(App.dispatch(event));
      });
  },
  async () => {
    // Error on unknown commands
    program.on('command:*', async () => {
      console.error(
        'Invalid command: %s\nSee --help for a list of available commands.',
        program.args.join(' '),
      );
      process.exit(1);
    });
  },
];

const registerCommands = async () => {
  const promises = [];
  for (const fn of commands) {
    promises.push(fn());
  }
  return Promise.all(promises).then(() => {
    /**
     * Sort commands in the help
     */
    program.commands.sort((a: any, b: any) => a._name.localeCompare(b._name));
  });
};

Promise.all(
  ((): Array<Promise<void>> => {
    const promises = [];
    promises.push(registerCommands());

    for (let module of modules) {
      if (module instanceof Registrator) {
        module = module.register(App);
      }
      promises.push(Promise.resolve(module));
    }
    return promises;
  })(),
).then(() => {
  /**
   * Print help if no arguments passed
   */
  // tslint:disable-next-line:no-floating-promises
  if (process.argv.slice(2).length === 0) {
    program.help();
  }

  program.parse(process.argv);
});
