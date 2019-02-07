const User = require("../models/user");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

module.exports.addProject = async (req, res, next) => {
  const body = _.pick(req.body, ["project"]);
  const newProjectsArray = [ ...req.user.projects, body.project ];

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { $set: { projects: newProjectsArray } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).send();
  }
  res.status(200).send(updatedUser);
};
