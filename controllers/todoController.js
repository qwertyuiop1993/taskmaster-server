const { Todo } = require("../models/todo");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

module.exports.createTodo = async (req, res, next) => {
  try {
    const todo = await new Todo({
      // create new todo instance to save to database
      text: req.body.text,
      dueDate: req.body.dueDate || null,
      category: req.body.category,
      _creator: req.user._id // get user id and set it as creator on the newly created todo
    }).save();
    res.send(todo);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({
      _creator: req.user._id // find all the todos created by the user
    });
    res.send({ todos });
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getTodoCount = async (req, res, next) => {
  try {
    const todos = await Todo.find({
      _creator: req.user._id
    });

    const count = {};
    const projects = [{ name: "Inbox" }, ...req.user.projects];
    // set the count for each project at 0 to start with
    projects.forEach((project) => (count[project.name] = 0));
    todos.forEach((todo) => {
      count[todo.category]++;
    });
    res.send(count);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getTodosByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const todos = await Todo.find({
      _creator: req.user._id,
      category: category
    });
    res.send({ todos });
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getTodoById = async (req, res, next) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  const todo = await Todo.findOne({
    _id: id,
    _creator: req.user._id
  });

  if (!todo) {
    return res.status(404).send("Todo not found");
  }
  res.send({ todo: todo });
};

module.exports.deleteTodoById = async (req, res, next) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send("Invalid ID");
  }

  const deletedTodo = await Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  });

  if (!deletedTodo) {
    return res.status(404).send();
  }
  res.status(200).send({ todo: deletedTodo });
};

module.exports.editTodoById = async (req, res, next) => {
  const { id } = req.params;
  const body = _.pick(req.body, ["text", "completed", "dueDate", "indexInList"]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send("Invalid ID");
  }

  if (_.isBoolean(body.completed) && body.completed) {
    // if the user sets completed as a boolean and that boolean is truthy, then set the time of compeltion property on the todo
    body.completedAt = new Date().getTime();
  } else {
    // if the todo is not completed, set completed to false and completedAt property to null
    body.completed = false;
    body.completedAt = null;
  }

  const updatedTodo = await Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    { $set: body },
    { new: true }
  );

  if (!updatedTodo) {
    return res.status(404).send();
  }
  res.status(200).send({ todo: updatedTodo });
};

module.exports.updateTodoProject = async (req, res, next) => {
  const { id } = req.params;
  const { oldProject, newProject, indexInList } = req.body;

  // find all associated todos from the oldProject
  const todos = await Todo.find({
    _creator: req.user._id,
    category: oldProject
  });
  // sort the todos by indexInList
  const sortedTodos = [...todos].sort((a, b) => a.indexInList - b.indexInList);
  // take away todo that has been moved
  sortedTodos.splice(indexInList, 1);

  console.log("sortedTodos without edited todo", sortedTodos);

  // go through the reordered array and assign the new index of each todo to the todo in the database
  sortedTodos.forEach(async (todo, index) => {
    const updatedTodo = await Todo.findOneAndUpdate(
      {
        _id: todo._id,
        _creator: req.user._id
      },
      { $set: { indexInList: index } },
      { new: true }
    );
  });

  // find all todos associated with the newProject and add one to their indexInList property
  await Todo.updateMany(
    {
      _creator: req.user._id,
      category: newProject
    },
    { $inc: { indexInList: 1 } },
    { new: true }
  );

  // update todo with newProject, give it an indexInList of 0
  const updatedTodo = await Todo.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    { $set: { indexInList: 0, category: newProject } },
    { new: true }
  );

  // send the updated todos in the old project
  const updatedOldProject = await Todo.find({
    _creator: req.user._id,
    category: oldProject
  });

  if (!updatedOldProject) {
    return res.status(404).send();
  }
  res.status(200).send({ todos: updatedOldProject });

};
