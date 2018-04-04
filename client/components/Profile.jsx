import React from 'react';
import axios from 'axios';


class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      error: true
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const username = $("#username").val();

    // Check if the username in the input is already used
    axios.get('/isUserNameAvailable', { headers: { username: username }})
      .then((response) => {
        if (response.data === false) {
          this.setState({
            error: true,
          });
        }
      })
      .catch((error) => {
        console.error(error)
      });

    this.setState({
      username: username,
      // only letters, numbers and _ allowed ; Less than 15 characters
      error: !/^\w+$/.test(username) | username.length > 14,
    });
  }

  handleSubmit() {
    const body = {
      username: this.state.username
    };

    axios.post('/createProfile', body, { headers: { Authorization: "Bearer " + localStorage.getItem("idToken") }})
      .then((response) => {
        window.location.replace(location.origin);
      })
      .catch((error) => {
        console.error(error)
      });
  }

  render() {
    return (
      <div className="componentPadding">
        <h1 className="title">My profile</h1>
        <div className="field">
          <label className="label">Username</label>
          <div className="control has-icons-left">
            <input className="input" id='username'
                   autoComplete="off" type="text"
                   placeholder="username"
                   onChange={this.handleChange}/>
            <span className="icon is-small is-left">
              <i className="fas fa-user"/>
            </span>
          </div>
          <p className="help">Must be unique. Only letters, numbers or underscores. Less than 15 characters.</p>
          <p className="help">Note: each asset of the website is deleted after a month.</p>
        </div>
        <button className="button is-link" onClick={this.handleSubmit} disabled={this.state.error}>Submit</button>
      </div>
    );
  }
}


export default Profile;