import React from 'react';
import { Form, Message } from 'semantic-ui-react';
import axios from 'axios';


class AddCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pictureUrl: "",
      text: "",
      error: true,
      loading: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleImageNotFound = this.handleImageNotFound.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const pictureUrl = $("#pictureUrl").val();
    const text = $("#text").val();



    this.setState({
      pictureUrl: pictureUrl,
      text: text,
      error: ! isPictureURLValid(pictureUrl)
    });
  }

  handleImageNotFound() {
    this.setState({
      error: true,
    })
  }

  handleSubmit() {
    const body = {
      pictureUrl: this.state.pictureUrl,
      text: this.state.text
    };

    this.setState({
      loading: true,
    });

    axios.post('/createCard', body, { headers: { Authorization: "Bearer " + localStorage.getItem("idToken") }})
      .then((response) => {
        window.location.replace(location.origin);
      })
      .catch((error) => {
        window.location.replace(location.origin);
      });
  }

  render() {
    return (
      <div className="componentPadding">
        <h1 className="title">Add a card</h1>
        <div className="field">
          <label className="label">Picture URL</label>
          <div className="control has-icons-left">
            <input className="input" id='pictureUrl'
                   autoComplete="off" type="url"
                   placeholder="picture url"
                   onChange={this.handleChange}/>
            <span className="icon is-small is-left">
              <i className="fas fa-image"/>
            </span>
          </div>
          <p className="help">Please enter a working direct link to an image. The url must end with .jpeg, .jpg, .gif or .png.</p>
        </div>
        <div className="field">
          <label className="label">Text</label>
          <div className="control has-icons-left">
            <input className="input" id='text'
                   autoComplete="off" type="text"
                   placeholder="text"
                   onChange={this.handleChange}/>
            <span className="icon is-small is-left">
              <i className="fas fa-font"/>
            </span>
          </div>
        </div>
        { !this.state.error &&
          <div className="field">
            <label className="label">Image preview</label>
            <img src={this.state.pictureUrl} onError={this.handleImageNotFound}/>
          </div>
        }
        <button className="button is-link" onClick={this.handleSubmit} disabled={this.state.error}>
          {this.state.loading ? "Please wait…" : "Submit"}
        </button>
      </div>
    );
  }
}

function isPictureURLValid(url) {
  return(url.match(/\.(jpeg|jpg|gif|png)$/) !== null);
}

export default AddCard;