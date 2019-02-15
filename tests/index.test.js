// stuff for testing basic routing
const request = require("supertest");
const { app } = require("./../index.js");
const server = request.agent(app); // set up agent for session testing

// stuff for testing database
const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const User = require("./../models/user");
const { Todo } = require("../models/todo");
const { users, populateUsers, todos, populateTodos } = require("./seed/seed.js");

// beforeEach(populateUsers);
beforeEach(populateTodos);
beforeEach(populateUsers);

// sign in with mock passport strategy that returns user 1 from seed as logged in user
describe("create session", () => {
  it("should create a session", (done) => {
    server
      .get("/auth/mock")
      .expect(200)
      .end(done);
  });
});

describe("GET /api/current_user", () => {
  it("should return current user when logged in", (done) => {
    server
      .get("/api/current_user")
      .expect(200)
      .expect((res) => {
        expect(res.body["_id"]).toBeTruthy();
      })
      .end(done);
  });

  it("should return unauthorized when user logged out", (done) => {
    request(app)
      .get("/api/current_user")
      .expect(401)
      .end(done);
  });
});

// Todo tests
describe("GET /api/todos", () => {
  it("should fetch a user's todos if user is logged in", (done) => {
    server
      .get("/api/todos")
      .expect(200)
      .expect((res) => {
        expect(res.body["todos"].length).toEqual(2); // there should be two todos
      })
      .end(done);
  });

  it("should return unauthorized if user is not logged in", (done) => {
    request(app) // don't use agent if simulating requests without login
      .get("/api/todos")
      .expect(401)
      .end(done);
  });
});

describe("GET /api/todos/:id", () => {
  it("should fetch a specific todo if user is logged in", (done) => {
    server
      .get(`/api/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", (done) => {
    let hexId = new ObjectID().toHexString();
    server
      .get(`/api/todos/${hexId}`) // get a new objectID that is not in the collection of todos
      .expect(404)
      .end(done);
  });

  it("should return 404 for non-object ids", (done) => {
    server
      .get(`/api/todos/123`)
      .expect(404)
      .end(done);
  });

  it("should not return todo doc created by other user", (done) => {
    request(app)
      .get(`/api/todos/${todos[1]._id.toHexString()}`) // get second todo item (by user two_)
      .expect(401)
      .end(done);
  });
});

describe("POST /api/todos", () => {
  it("should add a todo to the database", (done) => {
    const text = "This is a test";
    server
      .post("/api/todos")
      .send({ text: text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({ text: text })
          .then((todos) => {
            expect(todos.length).toEqual(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((e) => done(e));
      });
  });

  it("should not create todo with invalid body data", (done) => {
    server
      .post("/api/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(3);
            done();
          })
          .catch((e) => done(e));
      });
  });

  it("should return unauthorized if user is not logged in", (done) => {
    request(app)
      .post("/api/todos")
      .send({ text: "This is a test" })
      .expect(401)
      .end(done);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("should return deleted todo", (done) => {
    const hexId = todos[0]._id.toHexString();
    server
      .delete(`/api/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        // pass a callback into then end method in order to check database
        if (err) {
          return done(err);
        }
        Todo.findById(hexId)
          .then((todo) => {
            // check database for the todo you just deleted
            expect(todo).toBeFalsy(); // expect it to not to exist
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("should not remove todo created by another user", (done) => {
    const hexId = todos[2]._id.toHexString(); // try to delete third todo (created by user 2)
    server
      .delete(`/api/todos/${hexId}`)
      .expect(404)
      .end((err, res) => {
        // pass a callback into then end method in order to check database
        if (err) {
          return done(err);
        }
        Todo.findById(hexId)
          .then((todo) => {
            // check database for the todo you just deleted
            expect(todo).toBeTruthy(); // expect it to still exist
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("should return 404 if todo not found", (done) => {
    const hexId = "5bb372f4e029fa56b7b86a29";
    server
      .delete(`/api/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 if object id is invalid", (done) => {
    server
      .delete("/api/todos/123")
      .expect(404)
      .end(done);
  });
});

describe("PATCH /api/todos/:id", () => {
  it("should update todo", (done) => {
    const hexId = todos[0]._id.toHexString();
    const text = "Updated";
    server
      .patch(`/api/todos/${hexId}`)
      .send({
        text: text,
        completed: true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.text).toBe("Updated");
        expect(typeof res.body.todo.completedAt).toBe("number");
      })
      .end(done);
  });

  it("should clear completedAt when todo is not completed", (done) => {
    const hexId = todos[0]._id.toHexString();
    server
      .patch(`/api/todos/${hexId}`)
      .send({ completed: false, text: "Updated" })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe("Updated");
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });

  it("should not update todo if todo id does not belong to current user", (done) => {
    const hexId = todos[2]._id.toHexString();
    const text = "Updated";

    server
      .patch(`/api/todos/${hexId}`)
      .send({
        text: text,
        completed: true
      })
      .expect(404)
      .end(done);
  });
});

describe("GET /api/todos/count", () => {
  it("should return a count of all the todos in each project", (done) => {
    server
      .get("/api/todos/count")
      .expect(200)
      .expect((res) => {
        expect(res.body.Misc).toEqual(2);
        expect(res.body.Inbox).toEqual(0);
        expect(res.body.Work).toEqual(0);
      })
      .end(done);
  });
});

// Project tests
describe("PATCH /api/current_user/addProject", () => {
  it("should add a project", (done) => {
    server
      .patch("/api/current_user/addProject")
      .send({ projectName: "New Project" })
      .expect(200)
      .expect((res) => {
        expect(res.body.projects.length).toEqual(3);
        expect(res.body.projects[0].name).toBe("New Project");
      })
      .end(done);
  });

  it("should not allow modifications when not logged in", (done) => {
    request(app)
      .patch("/api/current_user/addProject")
      .send({ project: "New Project" })
      .expect(401)
      .end(done);
  });
});

describe("DELETE /api/current_user/deleteProject/:name", () => {
  it("should delete named project from user object", (done) => {
    server
      .delete("/api/current_user/deleteProject/Misc")
      .expect(200)
      .expect((res) => {
        expect(res.body.projects.length).toEqual(1);
        expect(res.body.projects[0].name).toBe("Work"); // expect remaining project not to be the deleted one
      })
      .end(done);
  });

  it("should delete todos associated with the project from the db", (done) => {
    server
      .delete("/api/current_user/deleteProject/Misc")
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({ _creator: users[0]._id, category: "Misc" })
          .then((todos) => {
            expect(todos.length).toEqual(0);
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("should not delete named project from user object of other users", (done) => {
    server // logged in as user 1
      .delete("/api/current_user/deleteProject/Misc")
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ _id: users[1]._id })
          .then((user) => {
            expect(user.projects[0].name).toBe("Misc"); // user 2 should still have Misc project
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("should not delete todos of other users with the same project name", (done) => {
    server // logged in as user 1
      .delete("/api/current_user/deleteProject/Misc")
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // user 2 should still have todos associated with Misc
        Todo.find({ _creator: users[1]._id, category: "Misc" }).then((todos) => {
          expect(todos.length).toEqual(1);
          done();
        });
      });
  });

  it("should not let users who are not logged in manipulate projects", (done) => {
    request(app) // not logged in
      .delete("/api/current_user/deleteProject/Misc")
      .expect(401)
      .end(done);
  });
});

describe("PATCH /api/current_user/editProjectName/:id", () => {
  it("should change project name in user's projects array", (done) => {
    server
      .patch(`/api/current_user/editProjectName/${users[0].projects[0]._id}`)
      .send({ newName: "ENS" })
      .expect(200)
      .expect((res) => {
        expect(res.body.projects[0].name).toBe("ENS");
      })
      .end((err, res) => {
        User.findOne({ _id: users[0]._id })
          .then((user) => {
            expect(user.projects[0].name).toBe("ENS");
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("should change category of associated todos to the new name", (done) => {
    server
      .patch(`/api/current_user/editProjectName/${users[0].projects[0]._id}`)
      .send({ oldName: "Misc", newName: "ENS" })
      .expect(200)
      .end((err, res) => {
        Todo.find({ _creator: users[0]._id, category: "ENS" })
          .then((todos) => {
            expect(todos[0].text).toBe("First test todo");
            expect(todos[1].text).toBe("Second test todo");
            done();
          })
          .catch((err) => done(err));
      });
  });
});

describe("PATCH /api/current_user/editProjectColor/:id", () => {
  it("should change the associated color of the project in user object", (done) => {
    server
      .patch(`/api/current_user/editProjectColor/${users[0].projects[0]._id}`)
      .send({ color: "red" })
      .expect(200)
      .expect((res) => {
        expect(res.body.projects[0].color).toBe("red");
      })
      .end((err, res) => {
        User.findOne({ _id: users[0]._id })
          .then((user) => {
            expect(user.projects[0].color).toBe("red");
            done();
          })
          .catch((err) => done(err));
      });
  });
});

describe("PATCH /api/current_user/updateProjectOrder", () => {
  it("should change the order of the user's projects array", (done) => {
    server
      .patch("/api/current_user/updateProjectOrder")
      .send({ oldIndex: 0, newIndex: 1 })
      .expect(200)
      .expect((res) => {
        expect(res.body.projects[0].name).toBe("Work");
        expect(res.body.projects[1].name).toBe("Misc");
      })
      .end((err, res) => {
        User.findOne({ _id: users[0]._id })
          .then((user) => {
            expect(user.projects[0].name).toBe("Work");
            expect(user.projects[1].name).toBe("Misc");
            done();
          })
          .catch((err) => done(err));
      });
  });
});

//logout

describe("GET /api/logout", () => {
  it("should log user out", (done) => {
    server
      .get("/api/logout")
      .expect(302)
      .end(done);
  });
});
