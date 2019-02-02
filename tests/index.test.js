// stuff for testing basic routing
const request = require("supertest");
const { app } = require("./../index.js");

// stuff for testing database
const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const User = require("./../models/user.js");
const { users, populateUsers } = require("./seed/seed.js");

beforeEach(populateUsers);

describe("POST /signup", () => {
  it("should save a new user and respond with 200 and a token", (done) => {
    request(app)
      .post("/signup")
      .send(JSON.stringify({ email: "test2@gmail.com", password: "sdgasgage" }))
      .expect(200)
      .expect((res) => {
        expect(res.body["token"]).toBeTruthy();
      })
      .end(done);
  });
});

describe("POST /signin", () => {
  it("should signin an existing user and respond with 200 and a token", (done) => {
    request(app)
      .post("/signin")
      .send(JSON.stringify({ email: "david@ens-lyon.fr", password: "password" }))
      .expect(200)
      .expect((res) => {
        expect(res.body["token"]).toBeTruthy();
      })
      .end(done);
  });

  it("should send 'Unauthorized' if user details not valid", (done) => {
    request(app)
      .post("/signin")
      .send(JSON.stringify({ email: "david@ens-lyon.fr", password: "pd" }))
      .expect((res) => {
        expect(res.text).toContain("Unauthorized");
      })
      .end(done);
  });
});

describe("GET /protected", () => {
  it("should respond with 'Hi there' if token is valid", (done) => {
    User.findById(users[0]._id).then((user) => {
      const token = user.generateAuthToken();
      request(app)
        .get("/protected")
        .set("authorization", token)
        .expect(200)
        .expect((res) => {
          expect(res.text).toContain("Hi there");
        })
        .end(done);
    });
  });

  it("should send 'Unauthorized' if user does not send a token", (done) => {
    User.findById(users[0]._id).then((user) => {
      request(app)
        .get("/protected")
        .expect((res) => expect(res.text).toContain("Unauthorized"))
        .end(done);
    });
  });
});
