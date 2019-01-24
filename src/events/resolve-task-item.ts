import { AlfredItem } from '../alfred';
import { BaseEvent } from './base-event';

export class ResolveTaskItem extends BaseEvent {
  public taskTitle: string;

  public taskManager: string;

  public taskUid?: string;

  public item?: AlfredItem;

  constructor(taskTitle: string, taskManager: string, taskUid?: string) {
    super();
    this.taskTitle = taskTitle;
    this.taskManager = taskManager;
    this.taskUid = taskUid;
  }
}
