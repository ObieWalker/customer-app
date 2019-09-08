import React from 'react';
import './AuthForm.css';
import FormControl from 'react-bootstrap/FormControl';

class AuthForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailError: '',
      passwordError: '',
      fullNameError: '',
      submitError: ''
    }

    this.submitBtnRef = React.createRef();

    this.lastClickedElement = null;
    this.shouldBlur = null;

    this.onSubmit = this.onSubmit.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.fullNameChange = this.fullNameChange.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('mousedown', this._onMouseDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('mousedown', this._onMouseDown);
  }

  _onKeyDown = event => {
    this.shouldBlur = event.key === 'Tab';
  };

  _onMouseDown = event => {
    this.lastClickedElement = event.target;
    this.shouldBlur = false;
  }

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.shouldBlur = true;
      this.submitBtnRef.current.click();
      this.submitBtnRef.current.focus();
    }
  }

  handleBlurCapture = event => {
    const isSibling = this.lastClickedElement &&
      this.lastClickedElement.parentNode === event.target.parentNode;

    if (isSibling && !this.shouldBlur) {
      event.stopPropagation();
    }
  }

  onSubmit(e) {
    if(!this.email) {
      this.setState({ emailError: 'Email required!', passwordError: null, fullNameError: null });
      return;
    }
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(this.email)) {
      this.setState({ emailError: 'Invalid email address!', passwordError: null, fullNameError: null });
      return;
    }
    if(!this.password) {
      this.setState({ passwordError: 'Password required!', fullNameError: null, emailError: null});
      return;
    }
    if(!this.props.signIn && !this.fullName) {
      this.setState({ fullNameError: 'Full name required!', emailError: null, passwordError: null });
      return;
    }

    if(this.props.onSubmit) {
      this.props.onSubmit(this.email, this.password, this.fullName);
    }
  }

  emailChange(e) {
    this.email = e.target.value;
  }

  passwordChange(e) {
    this.password = e.target.value;
  }

  fullNameChange(e) {
    this.fullName = e.target.value;
  }

  render() {

    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className={'errorInline' + (this.state.emailError ? '':' hidden')}>{this.state.emailError}</div>
          <FormControl className='emailInputTextbox' type='text' placeholder='Email' onChange={this.emailChange} />
        </div>

        <div className='row'>
          <div className={'errorInline' + (this.state.passwordError ? '':' hidden')}>{this.state.passwordError}</div>
          <FormControl className='passwordInputTextbox' type='password' placeholder='Password' onChange={this.passwordChange} />
        </div>

        <div className='row'>
          <div className={'errorInline' + (this.state.fullNameError ? '':' hidden')}>{this.state.fullNameError}</div>
          <FormControl className={'passwordInputTextbox' + (this.props.signIn ? ' hidden' : '')} type='text' placeholder='Full name' onChange={this.fullNameChange} />
        </div>

        <div className="row AuthForm__button" onClick={this.onSubmit}>
          <div className="btn btn--dark btn--rounded btn--full" ref={this.submitBtnRef}>
            {(this.props.signIn?'Sign In':'Sign Up')}
          </div>
        </div>
      </div>
    );
  }
}

export default AuthForm;
