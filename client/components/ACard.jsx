// To be displayed in the page AllCards

import React from 'react';
import axios from 'axios';

import placeholder from '../../public/placeholder.png';


class ACard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      picture_url: this.props.picture_url || placeholder,
      text: this.props.text || "Undefined",
      date: this.props.date || "1970-00-00",
      creator_username: this.props.creator_username || "undefined",
      nbLikes: this.props.nbLikes || 0,
      nbShares: this.props.nbShares || 0,
      hasLiked: this.props.hasLiked || false,
      hasShared: this.props.hasShared || false,
      isJustDeleted: false,
    };

    this.handleImageNotFound = this.handleImageNotFound.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleShare = this.handleShare.bind(this);
  }

  handleImageNotFound() {
    this.setState({
      picture_url: placeholder,
    })
  }

  handleDelete() {
    axios.delete('/cards/delete/' + this.props.id, { headers: { Authorization: "Bearer " + localStorage.getItem("idToken") }})
      .then(() => { this.setState({isJustDeleted: true}) })
      .catch((error) => (console.error(error)));
  }

  handleLike() {
    axios.post('/cards/like/' + this.props.id, null, { headers: { Authorization: "Bearer " + localStorage.getItem("idToken") }})
      .then((response) => { this.setState({nbLikes: response.data.nbLikes, hasLiked: response.data.hasLiked}) })
      .catch((error) => (console.error(error)));
  }

  handleShare() {
    axios.post('/cards/share/' + this.props.id, null, { headers: { Authorization: "Bearer " + localStorage.getItem("idToken") }})
      .then((response) => { this.setState({nbShares: response.data.nbShares, hasShared: response.data.hasShared}) })
      .catch((error) => (console.error(error)));
  }

  render() {
    // For each 300px, display one more card in the line
    const windowWidth = window.innerWidth;
    const nbCardsPerLine = Math.ceil(windowWidth/300);
    const cardStyle = {
      width: 100/nbCardsPerLine+"%"
    };

    return (
      <React.Fragment>
        { !this.state.isJustDeleted && (

          <div style={cardStyle} className="card">
            <div className="card-content">
              <img src={this.state.picture_url} alt="Card's picture" onError={this.handleImageNotFound}/>
              <h2>{this.state.text}</h2>
            </div>
            <h3 style={{"textAlign": "center"}}>
              <a href={location.origin+"/page/"+this.state.creator_username}>{this.state.creator_username}</a>
              &nbsp;-&nbsp;
              {this.state.date}
            </h3>

            <footer className="card-footer">
              {/* If the user has no username, it is not authenticated -> disable the buttons and click behaviour */}

              <span disabled={!this.props.username}
                    className={"card-footer-item button is-danger " + (this.state.hasLiked ? "" : "is-outlined ")}
                    onClick={this.props.username && this.handleLike} style={{"borderRadius": "0", "border": "0"}}>
                <i className="fa fa-heart" />
                 {this.state.nbLikes}
              </span>
              <span disabled={!this.props.username}
                    className={"card-footer-item button is-success " + (this.state.hasShared ? "" : "is-outlined")}
                    onClick={this.props.username && this.handleShare} style={{"borderRadius": "0", "border": "0"}}>
                <i className="fa fa-retweet"/>
                 {this.state.nbShares}
              </span>
              {this.state.creator_username === this.props.username &&
              <span className="card-footer-item button is-dark is-outlined"
                    onClick={this.handleDelete} style={{"borderRadius": "0", "border": "0"}}>
                <i className="fa fa-trash"/>
                 Delete
              </span>
              }
            </footer>

          </div>
        )}
      </React.Fragment>
    );
  }
}

export default ACard;