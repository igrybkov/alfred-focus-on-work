import { BaseEvent } from './base-event';

export class StartWorkOnTask extends BaseEvent {
  public taskTitle: string;

  public taskManager: string;

  public taskUid?: string;

  /**
   * Time to work (in minutes)
   */
  public timeInMinutes: number;

  constructor(
    taskTitle: string,
    taskManager: string,
    timeInMinutes: number,
    taskUid?: string,
  ) {
    super();
    this.taskTitle = taskTitle;
    this.taskManager = taskManager;
    this.timeInMinutes = timeInMinutes;
    this.taskUid = taskUid;
  }
}
