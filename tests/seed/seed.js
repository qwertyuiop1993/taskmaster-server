const { ObjectID } = require("mongodb");
const User = require("./../../models/user.js");
const jwt = require("jsonwebtoken");

// create mongodb object ID for our fake users
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

// create an array of users
const users = [
  {
    _id: userOneId,
    email: "test@example.com",
    password: "password"
  },
  {
    _id: userTwoId,
    email: "david@ens-lyon.fr",
    password: "password"
  }
];

// function to populate User database with our users
const populateUsers = (done) => {
  User.deleteMany({}).then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]).then(() => {
      done();
    });
  });
};

// export users and populateUsers to be used in our test file before every test
module.exports = {
  users: users,
  populateUsers: populateUsers
};
