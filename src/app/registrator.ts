// @flow./application
import Application from './application';

export class Registrator {
  private readonly fn: CallableFunction;

  constructor(fn: CallableFunction) {
    this.fn = fn;
  }

  public async register(app: Application) {
    await this.fn(app);
  }
}
