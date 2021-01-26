'use strict';
import { v4 as uuidv4 } from 'uuid';
import { AlfredOutput } from '../alfred';

export interface EventInterface {
  output: AlfredOutput;
  name: string;
  sessionUuid: string;
  isPropagationStopped(): boolean;
  stopPropagation(): void;
}

export abstract class BaseEvent implements EventInterface {
  public readonly name: string;

  public output: AlfredOutput;

  private propagationStopped: boolean;

  constructor(sessionUuid?: string) {
    this.name = this.constructor.name;
    this.output = {
      items: [],
      variables: {
        sessionUuid: sessionUuid || process.env.uuid || uuidv4(),
      },
    };
  }

  get sessionUuid(): string {
    return this.output.variables.sessionUuid.toString();
  }

  set sessionUuid(uuid: string) {
    this.output.variables.sessionUuid = uuid;
  }

  public isPropagationStopped(): boolean {
    return this.propagationStopped;
  }

  public stopPropagation(): void {
    this.propagationStopped = true;
  }
}
