import React from 'react'
import { Switch, Route } from 'react-router-dom'
import axios from 'axios';

import Header from './Header.jsx'

import AllCards from './AllCards.jsx'
import MyCards from './MyCards.jsx'
import Profile from './Profile.jsx'
import AddCard from './AddCard.jsx'

import history from '../history';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: null,
      hasAProfile: false,
      full_name: null,
      city: null,
      state: null,
    };

    this.props.auth.handleAuthentication();

    // console.log("Authenticated? " + this.props.auth.isAuthenticated());
    // console.log("accessToken? " + localStorage.getItem("accessToken"));
  }

  async componentDidMount() {
    if (this.props.auth.isAuthenticated()) {

      // Search for the profile at the loading of the app, if no profile, redirect (CSR) to the page to set profile
      await axios.get('/searchProfile', { headers: { Authorization: "Bearer "+ localStorage.getItem("idToken") }})
        .then((response) => {

          if (response.data) {
            this.setState({
              username: response.data.username,

              hasAProfile: true,
              full_name: response.data.full_name,
              city: response.data.city,
              state: response.data.state,
            });
          } else {
            history.push('/profile')
          }
        })
        .catch((error) => {
          console.error(error)
        });
    }
  }

  render() {
    return (
      <div>
        <Header auth={this.props.auth} username={this.state.username} hasAProfile={this.state.hasAProfile} />
        <Switch>

          /* An unauthenticated user can access all cards and pages */
          <Route exact path="/" render={ () => <AllCards auth={this.props.auth} username={this.state.username}/>} />
          <Route path="/page/:username"
                 render={ (props) => <MyCards auth={this.props.auth} username={this.state.username} {...props} />}
          />

          /* An authenticated user can go to the profile */
          { this.props.auth.isAuthenticated() &&
            <Route path="/profile" render={() => <Profile />}/>
          }

          /* An authenticated user with a profile can create a card */
          { this.state.hasAProfile &&
            <Route path="/add" render={() => <AddCard />} />
          }

          /* If no URL match, the default behaviour is to render the home */
          <Route render={ () => <AllCards auth={this.props.auth} username={this.state.username}/> } />

        </Switch>
      </div>
    );
  }
}

export default App;