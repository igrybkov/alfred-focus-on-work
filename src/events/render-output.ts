import { AlfredOutput } from '../alfred';
import { BaseEvent } from './base-event';

export class RenderOutput extends BaseEvent {
  constructor(output: AlfredOutput) {
    super();
    this.output = output;
  }
}
