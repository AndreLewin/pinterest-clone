import React from 'react';
import axios from 'axios';

import ACard from './ACard.jsx'
import Masonry from 'react-masonry-component'


class AllCards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: this.props.match.params.username,
      cards: [],
      loading: true,
    }
  }

  componentDidMount() {
    // Get the cards from the DB
    axios.get('/searchCards/user/'+this.state.username, { headers: { Authorization: "Bearer " + localStorage.getItem("idToken") }})
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
                {this.state.username}'s cards
              </h1>
              <h2 className="subtitle">
                <React.Fragment>
                  All the cards added and shared by {this.state.username}.
                </React.Fragment>
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
