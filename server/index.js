const express = require('express');
const helmet = require('helmet');
const app = express();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('./model/User');
const Card = require('./model/Card');
const Like = require('./model/Like');
const Share = require('./model/Share');

// If a route is private to authenticated users with Auth0
// Authorization: Bearer tokenId (JWT) ; Algorithm: RS256
const checkJwt = require('./checkJwt');


// Get process.env.VARIABLES from .env
require('dotenv').load();

// CORS is needed for authentication with Auth0
app.use(cors());

// Helmet for security
app.use(helmet());

// Make the content of ./public accessible from URL
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Use and configure body-parser for reading the body of HTTP requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// For debugging
app.use(function(err, req, res, next){
  console.error(err.stack);
  return res.status(err.status).json({ message: err.message });
});

// Use the webpack dev server as a middleware, so we can launch it from this file
const config = require('../webpack.dev.config');
const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {colors: true}
}));

// Configure Mongoose
mongoose.connect(process.env.DB_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;


app.get('/searchProfile', async (req, res) => {

  // Authenticate the user by acquiring its user_id from its accessToken
  const user_id = getUserId(req.headers.authorization);
  if (!user_id) { res.status(400).send("Bad Request: is your accessToken in localStorage correct?"); return;  }

  // Get the user entry from the database, if the authenticated user has no entry, redirect (see App.jsx)
  const user = await User.findOne({ user_id: user_id });
  if (user) {
    res.status(200).send(user);
  } else {
    res.status(204).send("No content: your id is valid. You have no profile so let's create one.")
  }
});


app.get('/isUserNameAvailable', async (req, res) => {
  const username = req.headers.username;
  res.send(! await User.findOne({ username: username }));
});


// Create or Edit a profile
app.post('/createProfile', checkJwt, async (req, res) => {

  const user_id = getUserId(req.headers.authorization);
  const username = req.body.username;

  if (username === undefined) {
    res.status(400).send("Bad Request: username field missing");
    return;
  }

  if (!/^\w+$/.test(username)) {
    res.status(400).send("Bad Request: username invalid, please use only letters, numbers and underscores");
    return;
  }

  if (username.length > 14){
    res.status(400).send("Bad Request: username invalid, it must have less than 15 characters");
    return;
  }

  if (await User.findOne({ username: username })) {
    res.status(400).send("Bad Request: username already used");
    return;
  }

  // At this point, the request is valid
  // Recreate a user with the user_id. Delete the past one if it exists
  const oldUser = await User.findOne({ user_id: user_id });
  if (oldUser) {
    oldUser.remove();
  }

  const newUser = new User({
    user_id: user_id,
    username: username
  });
  newUser.save();

  res.status(204).send("User successfully created or updated");
});


app.post('/createCard', checkJwt, async (req, res) => {

  const pictureUrl = req.body.pictureUrl;
  const text = req.body.text;
  const userId = getUserId(req.headers.authorization);

  if (! pictureUrl.match(/\.(jpeg|jpg|gif|png)$/)) {
    res.status(400).send("Bad Request: wrong picture URL ending");
    return;
  }

  // Check if it is the direct URL of an image
  let picture;
  try {
    picture = await axios(pictureUrl);
  } catch (e) {
    res.status(400).send("Bad Request: this is not the direct link to a picture");
    return;
  }

  // Create a new Card
  const card = new Card({
    picture_url: pictureUrl,
    text: text,
    creator_id: userId
  });

  card.save();

  res.status(204).send("Card successfully created");
});


// Search the cards from all users, to display in "All cards"
// Authentication is not necessary
// If the user is authenticated (and has a profile), send extra data
app.get('/searchAllCards', async (req, res) => {

  let userId;
  const isAuthenticated = req.headers.authorization !== "Bearer null";
  if (isAuthenticated) {
    userId = getUserId(req.headers.authorization);
  }

  const cards = await Card.find().lean();

  // Sort the cards by date, latest (higher "Date") first
  cards.sort((a,b) => { return new Date(b.date) - new Date(a.date) });

  // For each card, add additional information about the owner user
  for (let i = 0; i < cards.length; i++) {
    const owner = await User.findOne({user_id: cards[i].creator_id });
    cards[i].creator_username = owner.username;
    cards[i].nbLikes = await Like.count({ card_id: cards[i]._id });
    cards[i].nbShares = await Share.count({ card_id: cards[i]._id });

    if (isAuthenticated) {
      cards[i].hasLiked = await Like.count({ user_id: userId, card_id: cards[i]._id }) === 1;
      cards[i].hasShared = await Share.count({ user_id: userId, card_id: cards[i]._id }) === 1;
    }
  }

  if (cards) {
    res.status(200).send(cards);
  } else {
    res.status(500).send("Could not find cards in the database");
  }
});


// Search the cards from a specific user (created and shared)
app.get('/searchCards/user/:username', async (req, res) => {

  let userId;
  const isAuthenticated = req.headers.authorization !== "Bearer null";
  if (isAuthenticated) {
    userId = getUserId(req.headers.authorization);
  }

  // Search the cards of the page user
  const pageUser = await User.findOne({username: req.params.username});
  const pageUserId = pageUser.user_id;
  const cards = await Card.find({creator_id: pageUserId}).lean();

  // Add the cards shared by the page user
  const shares = await Share.find({user_id: pageUserId});
  for (let i = 0; i < shares.length; i++) {
    const sharedCard = await Card.findOne({_id: shares[i].card_id}).lean();
    if (sharedCard.creator_id !== pageUserId) {
      cards.push(sharedCard);
    }
  }

  // Sort the cards by date, latest (higher "Date") first
  cards.sort((a,b) => { return new Date(b.date) - new Date(a.date) });

  // For each card, add additional information about the owner user
  for (let i = 0; i < cards.length; i++) {
    const owner = await User.findOne({user_id: cards[i].creator_id });
    cards[i].creator_username = owner.username;
    cards[i].nbLikes = await Like.count({ card_id: cards[i]._id });
    cards[i].nbShares = await Share.count({ card_id: cards[i]._id });

    if (isAuthenticated) {
      cards[i].hasLiked = await Like.count({ user_id: userId, card_id: cards[i]._id }) === 1;
      cards[i].hasShared = await Share.count({ user_id: userId, card_id: cards[i]._id }) === 1;
    }
  }

  if (cards) {
    res.status(200).send(cards);
  } else {
    res.status(500).send("Could not find cards in the database");
  }
});


// Delete a card
app.delete('/cards/delete/:card_id', checkJwt, async (req, res) => {

  const userId = getUserId(req.headers.authorization);
  const cardId = req.params.card_id;

  const card = await Card.findOne({ _id: cardId });
  if (!card) {
    res.status(404).send("Not Found: Can't found a card with this ID");
    return;
  }

  // Check if the user is the owner of the card
  if (card.creator_id !== userId) {
    res.status(403).send("Forbidden: That's not your card, you can not delete it.");
    return;
  }

  card.remove();
  res.status(204).send("Card successfully deleted");
});


// Like or unlike a card
app.post('/cards/like/:card_id', checkJwt, async (req, res) => {

  const userId = getUserId(req.headers.authorization);
  const cardId = req.params.card_id;

  const like = await Like.findOne({ user_id: userId, card_id: cardId });

  if (like) {
    await like.remove();
  } else {
    const newLike = new Like({ user_id: userId, card_id: cardId });
    await newLike.save();
  }

  const nbLikes = await Like.count({ card_id: cardId });

  res.status(200).send({nbLikes: nbLikes, hasLiked: !like});
});


// Share or unshare a card
app.post('/cards/share/:card_id', checkJwt, async (req, res) => {

  const userId = getUserId(req.headers.authorization);
  const cardId = req.params.card_id;

  const share = await Share.findOne({ user_id: userId, card_id: cardId });

  if (share) {
    await share.remove();
  } else {
    const newShare = new Share({ user_id: userId, card_id: cardId });
    await newShare.save();
  }

  const nbShares = await Share.count({ card_id: cardId });

  res.status(200).send({nbShares: nbShares, hasShared: !share});
});



// Extract the userId from the idToken (JWT) given by Auth0
const getUserId = (authHeader) => {
  const decoded = jwt.decode(authHeader.replace('Bearer ',''));
  const sub = decoded.sub;
  const subParts = sub.split('|');
  return subParts[subParts.length - 1];
};


// Listen for requests
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Default route: send index.html, so the BrowserRouter can analyse
// and display the element depending on the URL (CSR)
app.get('*',function (req, res) {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});
