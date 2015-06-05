import Component from './component';
import * as Dom from './utils/dom.js';
import * as Events from './utils/events.js';
import * as Fn from './utils/fn.js';
import document from 'global/document';
import assign from 'object.assign';

/** @class videojs.Button
  @root
  @super videojs.Component
  Base class for all buttons
@argument/Player|Object player
@argument/Object options
  @optional
*/
class Button extends Component {

  constructor(player, options) {
    super(player, options);

    this.emitTapEvents();

    this.on('tap', this.handleClick);
    this.on('click', this.handleClick);
    this.on('focus', this.handleFocus);
    this.on('blur', this.handleBlur);
  }

  /** @member/Function createEl
    Create the component's DOM element
  @argument/String type
    @optional
    @default `"button"`
    Element's node type. e.g. 'div'
  @argument/Object props
    @optional
    An object of element attributes that should be set on the element Tag name.
  @returns/Element
  */
  createEl(type='button', props={}) {
    // Add standard Aria and Tabindex info
    props = assign({
      className: this.buildCSSClass(),
      'role': 'button',
      'aria-live': 'polite', // let the screen reader user know that the text of the button may change
      tabIndex: 0
    }, props);

    let el = super.createEl(type, props);

    this.controlTextEl_ = Dom.createEl('span', {
      className: 'vjs-control-text'
    });

    el.appendChild(this.controlTextEl_);

    this.controlText(this.controlText_);

    return el;
  }

  controlText(text) {
    if (!text) return this.controlText_ || 'Need Text';

    this.controlText_ = text;
    this.controlTextEl_.innerHTML = this.localize(this.controlText_);

    return this;
  }

  /** @member/Function buildCSSClass
    Override point. Allows subclasses to stack CSS class names. The base class returns an empty
    String.
  @returns/String
  */
  buildCSSClass() {
    return `vjs-control vjs-button ${super.buildCSSClass()}`;
  }

  /** @member/Function handleClick
    Override point. Allows subclasses to define a click handler Function. The base method is a no-op
    so there's no need to call it.
  */
  handleClick() {}

  /** @member/Function handleFocus
    Override point. Allows subclasses to define a focus handler Function. **Always call the base
    method.**
  */
  handleFocus() {
    Events.on(document, 'keydown', Fn.bind(this, this.handleKeyPress));
  }

  /** @member/Function handleKeyPress
    Trigger click when keys are pressed.
  */
  handleKeyPress(event) {
    // Check for space bar (32) or enter (13) keys
    if (event.which === 32 || event.which === 13) {
      event.preventDefault();
      this.handleClick();
    }
  }

  /** @member/Function handleBlur
    Override point. Allows subclasses to define a focus handler Function. **Always call the base
    method.**
  */
  handleBlur() {
    Events.off(document, 'keydown', Fn.bind(this, this.handleKeyPress));
  }

}


Component.registerComponent('Button', Button);
export default Button;
