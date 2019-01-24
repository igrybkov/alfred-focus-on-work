'use strict';
// @flow
import { App, Registrator } from '../app';

import Application from '../app/application';
import { StartWorkOnTask, StopWorkOnTask } from '../events';

import { execString } from 'applescript';
import { promisify } from 'util';

export default new Registrator((app: Application) => {
  app.on(StartWorkOnTask.name, startFocus);
  app.on(StopWorkOnTask.name, stopFocus);
});

const startFocus = async (event: StartWorkOnTask) => {
  const timeInMinutes = event.timeInMinutes;
  const unfocusScript = 'do shell script "open focus://unfocus"';
  const focusScript = `do shell script "open focus://focus?minutes=${timeInMinutes}"`;

  let ascript = promisify(execString);
  await ascript(unfocusScript);

  ascript = promisify(execString);
  await ascript(focusScript);
};

const stopFocus = async () => {
  const unfocusScript = 'do shell script "open focus://unfocus"';

  // tslint:disable-next-line:no-empty
  execString(unfocusScript, () => {});
  //  Alfy.log(`Focus stopped`)
};
