import { BaseEvent } from './base-event';

export class StopWorkOnTask extends BaseEvent {
  constructor(sessionUuid: string) {
    super(sessionUuid);
  }
}
