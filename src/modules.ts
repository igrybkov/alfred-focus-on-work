import ActiveTask from './active-task';
import AllTasks from './all-tasks';
import { Registrator } from './app';
import DoNotDisturb from './do-not-disturb';
import Focus from './focus';
import RecentTasks from './recent-tasks';
import Settings from './settings';
import TaskPaper from './taskpaper';
import Things from './things';
import TimeList from './time-list';
import Timing from './timing';

type AppModule = Promise<void> | Registrator;

export const modules: AppModule[] = [
  ActiveTask,
  AllTasks,
  DoNotDisturb,
  Focus,
  RecentTasks,
  Settings,
  TaskPaper,
  Things,
  TimeList,
  Timing,
];
