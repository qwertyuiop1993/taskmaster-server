const passportService = require("./services/passport");
const passport = require("passport");
const UserController = require("./controllers/userController");
const TodoController = require("./controllers/todoController");

// middlewares
const requireGoogleLogin = passport.authenticate("google", { scope: ["profile", "email"] });
let requireMockLogin;
if(process.env.NODE_ENV === "test") {
  requireMockLogin = passport.authenticate("mock");
}

const requireLogin = require("./middlewares/requireLogin");

module.exports = function(app) {
  // auth routes
  app.get("/auth/google", requireGoogleLogin);

  app.get("/auth/google/callback", requireGoogleLogin, (req, res, next) => {
    res.redirect("/dashboard");
  });

  if(process.env.NODE_ENV === "test") {
    app.get("/auth/mock", requireMockLogin, (req, res, next) => {
      res.send(req.user);
    });
  }

  app.get("/api/current_user", requireLogin, (req, res) => {
    res.send(req.user);
  });

  // edit users projects
  app.patch("/api/current_user/addProject", requireLogin, UserController.addProject);
  app.patch("/api/current_user/editProjectName/:id", requireLogin, UserController.editProjectName);
  app.patch("/api/current_user/editProjectColor/:id", requireLogin, UserController.editProjectColor);
  app.patch("/api/current_user/editProjectImage/:id", requireLogin, UserController.editProjectImage);
  app.patch("/api/current_user/updateProjectOrder", requireLogin, UserController.updateProjectOrder);
  app.delete("/api/current_user/deleteProject/:id", requireLogin, UserController.deleteProject);

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // todo routes
  app.post("/api/todos", requireLogin, TodoController.createTodo);
  app.get("/api/todos", requireLogin, TodoController.getTodos);
  app.get("/api/todos/filter", requireLogin, TodoController.filterTodos); // using query strings
  app.get("/api/todos/count", requireLogin, TodoController.getTodoCount);
  app.get("/api/todos/:id", requireLogin, TodoController.getTodoById);
  app.delete("/api/todos/:id", requireLogin, TodoController.deleteTodoById);
  app.patch("/api/todos/:id", requireLogin, TodoController.editTodoById);
  app.patch("/api/todos/updateProject/:id", requireLogin, TodoController.updateTodoProject)
};
