import React from 'react';


class AuthButton extends React.Component {

  login() {
    this.props.auth.login();
  }
  logout() {
    this.props.auth.logout();
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    // Equivalent to isAuthenticated = this.props.auth.isAuthenticated

    return (
      <div>
        { !isAuthenticated() &&
          <a className="button is-info" onClick={this.login.bind(this)}><i className="fas fa-sign-in-alt"/>&nbsp;Sign up/in</a>
        }
        { isAuthenticated() &&
          <a className="button is-info" onClick={this.logout.bind(this)}><i className="fas fa-sign-out-alt"/>&nbsp;Sign out</a>
        }
      </div>
    );
  }
}

export default AuthButton;