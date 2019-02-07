const { ObjectID } = require("mongodb");
const _ = require("lodash");

const User = require("../models/user");
const { Todo } = require("../models/todo");

module.exports.addProject = async (req, res, next) => {
  const body = _.pick(req.body, ["project"]);
  const newProjectsArray = [...req.user.projects, body.project];

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id
    },
    { $set: { projects: newProjectsArray } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).send();
  }
  res.status(200).send(updatedUser);
};

module.exports.deleteProject = async (req, res, next) => {
  const projectToDelete = req.params.name;

  // delete the todos associated with this project
  const deletedTodos = await Todo.deleteMany({
    _creator: req.user._id,
    category: projectToDelete,
  })

  if(!deletedTodos) {
    return res.status(404).send();
  }

  // filter out the project to delete from the new projects array
  const newProjectsArray = req.user.projects.filter((project) => {
    return project !== projectToDelete;
  });

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id
    },
    { $set: { projects: newProjectsArray } },
    { new: true }
  );
  if (!updatedUser) {
    return res.status(404).send();
  }

  res.status(200).send(updatedUser);
};
