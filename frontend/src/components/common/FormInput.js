import React from 'react';
import ReactDOM from 'react-dom';
import './FormInput.css';

/**
 * Custom Input Field Element
 * Actual `input` element is hidden and user interacts with
 * a contentEditable `div`.
 * Behavior modelled after: https://ueno.co/contact
 *
 * @class FormInput
 * @extends {React.Component}
 */
class FormInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      underlineWidth: '0'
    };
    this.inputType = this.props.type ? this.props.type : 'text';

    this.inputRef = React.createRef();
    this.labelRef = React.createRef();
    this.pseudoLabelRef = React.createRef();
    this.textboxRef = React.createRef();
    this.textboxContainerRef = React.createRef();
    this.underlineRef = React.createRef();
  }

  /**
   * On textbox input:
   * 1. Change hidden input field's value and trigger that input
   * field's onChange function to trigger redux-form's onChange function
   * 2. Get textbox's width and set underline's width to match
   * 3. Set containerRef's bottom border (only visible when textbox is empty)
   *
   * @memberof FormInput
   */
  handleTextboxInput = () => {
    // 1
    const inputFieldNode = ReactDOM.findDOMNode(this.inputRef.current);
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, "value"
    ).set;
    nativeInputValueSetter.call(inputFieldNode, this.textboxRef.current.innerHTML);
    inputFieldNode.dispatchEvent(new Event('change', { bubbles: true }));

    // 2
    const textboxNode = ReactDOM.findDOMNode(this.textboxRef.current);
    this.setState({
      underlineWidth: (textboxNode.clientWidth - 1) + 'px',
    });

    // 3
    if (this.isTextboxEmpty()) {
      this.textboxContainerRef.current.className =
        'FormInput__textbox-container border--mercury';
    } else {
      this.textboxContainerRef.current.className =
        'FormInput__textbox-container border--transparent';
    }
  }

  handleBlur = event => {
    if (this.inputType !== 'password') {
      // Trim spaces in input
      this.textboxRef.current.innerHTML = this.textboxRef.current.innerHTML
        .replace(/&nbsp;/gi, '');
      this.handleTextboxInput();
    }

    this.props.input.onBlur(event);

    this.labelRef.current.className =
      'FormInput__label FormInput__label--inactive animated faster';
    this.pseudoLabelRef.current.className =
      'FormInput__pseudo-label animated faster';
    this.underlineRef.current.className =
      'FormInput__underline FormInput__underline--inactive';
    if (this.isTextboxEmpty()) {
      this.labelRef.current.className += ' fadeOutDown';
      this.pseudoLabelRef.current.className += ' fadeIn';
    } else {
      this.pseudoLabelRef.current.className += ' hidden';
    }
  }

  handleFocus = event => {
    this.props.input.onFocus(event);
    this.placeCaretAtEnd(event.target);

    if (this.props.meta.active) {
      return;
    }

    this.labelRef.current.className =
      'FormInput__label FormInput__label--active animated faster';
    this.pseudoLabelRef.current.className =
      'FormInput__pseudo-label animated faster';
    this.underlineRef.current.className =
      'FormInput__underline FormInput__underline--active';
    if (this.isTextboxEmpty()) {
      this.labelRef.current.className += ' fadeInUp';
      this.pseudoLabelRef.current.className += ' fadeOut';
    } else {
      this.pseudoLabelRef.current.className += ' hidden';
    }
  }

  clickContainer = () => {
    ReactDOM.findDOMNode(this.textboxRef.current).focus();
  }

  isTextboxEmpty = () => this.textboxRef.current.innerText.length === 0;

  hasError = () => !this.props.meta.active &&
    this.props.meta.error &&
    this.props.meta.touched;

  getErrorMessage = () => {
    if (this.hasError()) {
      return (
        <div className="FormInput__error-message">
          {this.props.meta.error}
        </div>
      );
    }

    return <div></div>;
  };

  placeCaretAtEnd(targetElem) {
    // Chrome, Firefox, Safari, Opera, IE 9+
    if (window.getSelection && document.createRange) {
      const range = document.createRange();
      range.selectNodeContents(targetElem);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (document.body.createTextRange) { // IE 8 and lower
      const textRange = document.body.createTextRange();
      textRange.moveToElementText(targetElem);
      textRange.collapse(false);
      textRange.select();
    }
  }

  render() {
    return (
      <div className={`FormInput ${this.hasError() ? 'has-error' : ''}`}
          onClick={this.clickContainer}>
        <label className="FormInput__label hidden" ref={this.labelRef}>
          {this.props.label}
        </label>
        <div className="FormInput__textbox-container"
            ref={this.textboxContainerRef}>
          <span className={`FormInput__textbox ${this.inputType}`} role="textbox"
              contentEditable="true" spellCheck="false"
              onInput={this.handleTextboxInput}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              ref={this.textboxRef}></span>
          <span className="FormInput__pseudo-label animated faster"
              ref={this.pseudoLabelRef}>
            {this.props.label}
          </span>
          <div className="FormInput__underline"
              style={{width: `${this.state.underlineWidth}`}}
              ref={this.underlineRef}></div>
          <input type={this.inputType}
              onChange={this.props.input.onChange}
              value={this.props.input.value}
              name={this.props.input.name}
              ref={this.inputRef} />
        </div>
        {this.getErrorMessage()}
      </div>
    );
  }
}

export default FormInput;
