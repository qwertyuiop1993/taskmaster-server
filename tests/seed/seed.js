const { ObjectID } = require("mongodb");
const User = require("./../../models/user");
const { Todo } = require("../../models/todo");

// create mongodb object ID for our fake users
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

// create an array of users
const users = [
  {
    _id: userOneId,
    email: "test@example.com",
    googleID: "5c5857600e4ce674c3a997d3",
    projects: ["Misc", "Work"]
  },
  {
    _id: userTwoId,
    email: "david@ens-lyon.fr",
    googleID: "384758852393837635",
    projects: ["Misc", "Holidays"]
  }
];

const todos = [
  {
    _id: new ObjectID(),
    text: "First test todo",
    category: "Misc",
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: "Second test todo",
    category: "Misc",
    completed: true,
    completedAt: new Date().getTime(),
    _creator: userTwoId
  }
];

const populateTodos = (done) => {
  Todo.deleteMany({})
    .then(() => {
      Todo.insertMany(todos);
    })
    .then(() => done());
};

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
  populateUsers: populateUsers,
  todos: todos,
  populateTodos: populateTodos
};
