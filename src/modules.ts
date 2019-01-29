// @flow
import ActiveTask from './active-task';
import AllTasks from './all-tasks';
import { Registrator } from './app';
import DoNotDisturb from './do-not-disturb';
import Focus from './focus';
import RecentTasks from './recent-tasks';
import TaskPaper from './taskpaper';
import Things from './things';
import TimeList from './time-list';
import Timing from './timing';

type AppModule = Promise<void> | Registrator;

export const modules: AppModule[] = [
  ActiveTask,
  RecentTasks,
  AllTasks,
  TaskPaper,
  Things,
  TimeList,
  Timing,
  DoNotDisturb,
  Focus,
];
