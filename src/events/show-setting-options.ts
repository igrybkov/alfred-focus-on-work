import { BaseEvent } from './base-event';

export class ShowSettingOptions extends BaseEvent {
  public settingPath?: string;

  constructor(settingPath: string) {
    super();
    this.settingPath = settingPath;
  }
}
