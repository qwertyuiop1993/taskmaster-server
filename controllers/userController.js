const { ObjectID } = require("mongodb");
const _ = require("lodash");

const User = require("../models/user");
const { arrayMove } = require("../services/arrayMove");
const { Todo } = require("../models/todo");

module.exports.addProject = async (req, res, next) => {
  const body = _.pick(req.body, ["projectName"]);
  const newProject = { name: body.projectName, color: "teal", image: null };
  const newProjectsArray = [ newProject, ...req.user.projects ];

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
  });

  if(!deletedTodos) {
    return res.status(404).send();
  }

  // filter out the project to delete from the new projects array
  const newProjectsArray = req.user.projects.filter((project) => {
    return project.name !== projectToDelete;
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

module.exports.updateProjectOrder = async (req, res, next) => {
  const { oldIndex, newIndex } = req.body;
  const updatedProjects = arrayMove(req.user.projects, oldIndex, newIndex);

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id
    },
    { $set: { projects: updatedProjects } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).send();
  }

  res.status(200).send(updatedUser);
};


module.exports.editProjectColor = async (req, res, next) => {
  const projectId = req.params.id;
  const color = req.body.color;

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      "projects._id": projectId
    },
    { $set: { "projects.$.color": color } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).send();
  }
  res.status(200).send(updatedUser);
};

module.exports.editProjectImage = async (req, res, next) => {
  const projectId = req.params.id;
  const updatedImage = req.body.image;

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      "projects._id": projectId
    },
    { $set: { "projects.$.image": updatedImage } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).send();
  }
  res.status(200).send(updatedUser);
};

module.exports.editProjectName = async (req, res, next) => {

  const projectToEdit = req.params.name;
  const newName = req.body.newName;

  // update todos to be associated with new name
  const updatedTodos = await Todo.update(
    { _creator: req.user._id, category: projectToEdit },
    { $set: { category: newName } },
    { new: true }
  );

  if(!updatedTodos) {
    return res.status(404).send();
  }
  // update user to have new name in projects array

  const newProjectsArray = req.user.projects.map(project => {
    if(project.name === projectToEdit) {
      return { ...project, name: newName };
    }
    return project;
  });

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { projects: newProjectsArray } },
    { new: true }
  )
  // send the updated user back
  if (!updatedUser) {
    return res.status(404).send();
  }
  res.status(200).send(updatedUser);
};
