import React from 'react'
import { Link } from 'react-router-dom'

import AuthButton from './AuthButton.jsx';

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  // TODO: replace "me" with a unique user name (like in Twitter)
  render() {
    return (
      <nav className="navbar is-dark">
        <div className="navbar-brand">
          <a className="navbar-item" onClick={() => {window.location.replace(location.origin)}}>
            <i className="fas fa-thumbtack"/><b>&nbsp;Pinglintereso</b>
          </a>
          <div className="navbar-burger burger" onClick={() => { document.querySelector('.navbar-menu').classList.toggle('is-active') }}>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="navbar-menu">
          <div className="navbar-start">
            { this.props.hasAProfile &&
              <React.Fragment>
                <Link className="navbar-item" to={"/page/" + this.props.username}>
                  <i className="fas fa-images"/>&nbsp;My cards
                </Link>
                <Link className="navbar-item" to="/add">
                  <i className="fas fa-plus-square"/>&nbsp;Add card
                </Link>
              </React.Fragment>
            }

            { this.props.auth.isAuthenticated() &&
              <Link className="navbar-item" to="/profile">
                <i className="fas fa-address-card"/>&nbsp;My profile
              </Link>
            }
          </div>


          <div className="navbar-end">
            { this.props.hasAProfile &&
              <div className="navbar-item">
                Hello {this.props.username}
              </div>
            }
            <div className="navbar-item">
              <AuthButton auth={this.props.auth}/>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}


export default Header;
