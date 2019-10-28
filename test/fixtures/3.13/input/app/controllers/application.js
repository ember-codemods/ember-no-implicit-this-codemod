import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  foo = 'foo';

  @action addDataAttrs(element) {
    // do stuff
  }
}
