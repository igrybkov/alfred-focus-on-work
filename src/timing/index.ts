import { execString } from 'applescript';
import { promisify } from 'util';
import { Application, Registrator } from '../app/index';
import { StartWorkOnTask, StopWorkOnTask } from '../events';

export default new Registrator((app: Application) => {
  app.on(StartWorkOnTask.name, startTiming);
  app.on(StopWorkOnTask.name, stopTiming);
});

const startTiming = async (event: StartWorkOnTask) => {
  const timeInMinutes = event.timeInMinutes;

  const time = 60 * timeInMinutes;
  const script = `tell application "TimingHelper" to start task with title "${
    event.taskTitle
  }" for about ${time}`;
  const ascript = promisify(execString);
  await ascript(script);
};

const stopTiming = async () => {
  const script = 'tell application "TimingHelper" to stop current task';
  const ascript = promisify(execString);
  await ascript(script);
};
