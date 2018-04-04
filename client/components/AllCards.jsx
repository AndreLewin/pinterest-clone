import React from 'react';
import axios from 'axios';

import ACard from './ACard.jsx'
import Masonry from 'react-masonry-component'


class AllCards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: [],
      loading: true,
    }
  }

  componentDidMount() {
    // Get the cards from the DB
    axios.get('/searchAllCards', { headers: { Authorization: "Bearer " + localStorage.getItem("idToken") }})
      .then((response) => {
        this.setState({
          cards: response.data,
          loading: false
        });
      })
      .catch((error) => { console.error(error)})
  }


  render() {
    const cardList = this.state.cards.map((card, index) => {
      return (
        <ACard
          key={card._id} id={card._id}
          picture_url={card.picture_url}
          text={card.text}
          creator_username={card.creator_username}
          date={card.date.split("T")[0]}
          nbLikes={card.nbLikes}
          nbShares={card.nbShares}
          hasLiked={card.hasLiked}
          hasShared={card.hasShared}
          username={this.props.username}
        />
      );
    });

    return (
      <div>
        <section className="hero is-light">
          <div className="hero-body">
            <div className="container">
              <h1 className="title is-1">
                All cards
              </h1>
              <h2 className="subtitle">
                { this.props.auth.isAuthenticated() ? (
                  <React.Fragment>
                    All the cards from the community. Don't forget to like and share!
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <a onClick={() => {this.props.auth.login()}} style={{"color": "hsl(217, 71%, 53%)"}}>Sign up/in </a>
                    to add cards, like them, and share them on your page.
                  </React.Fragment>
                )}
              </h2>
            </div>
          </div>
        </section>

        <Masonry
          // options={{ fitWidth: true }}
          // style={{margin: "0 auto"}}
        >
          {cardList}
        </Masonry>
      </div>
    );
  }
}

export default AllCards;
