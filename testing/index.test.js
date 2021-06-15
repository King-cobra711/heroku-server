const supertest = require("supertest");
const app = require("../index");
const request = supertest(app);

let cookie;

beforeAll(async (done) => {
  const res = await request.post("/login").send({
    Username: "testuser",
    Password: "aaaaaa",
  });
  const cookies = res.headers["set-cookie"][0]
    .split(",")
    .map((item) => item.split(";")[0]);
  cookie = cookies.join(";");
  done();
});

describe("Successful registration check with email, username and password", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request
      .post("/checkRegisterDetails")
      .set("Cookie", cookie)
      .send({
        Email: "jesttest@email.com.au",
        Username: "Jestyboy",
        Password: "Password",
      });
    expect(res.status).toBe(200);
    done();
  });
});

describe("Successful Login with email, username and password", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request.post("/register").set("Cookie", cookie).send({
      Email: "jesttestasfasd@email.com.au",
      Username: "Jestyboysdgfs",
      Password: "Password",
    });
    expect(res.statusCode).toBe(200);
    done();
  });
});

describe("Successful Login username and password", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request.post("/login").set("Cookie", cookie).send({
      Username: "testuser",
      Password: "aaaaaa",
    });
    expect(res.statusCode).toBe(200);
    done();
  });
});

describe("Successful retrieval of user's scores", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request.post("/userScores").set("Cookie", cookie).send({
      id: 43,
    });
    expect(res.status).toBe(200);
    done();
  });
});

describe("Successful update of user's Easy score", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request
      .post("/UpdateEasyScore")
      .set("Cookie", cookie)
      .send({
        id: 43,
        score: 10,
      });
    expect(res.status).toBe(200);
    done();
  });
});
describe("Successful update of user's Medium score", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request
      .post("/UpdateMediumScore")
      .set("Cookie", cookie)
      .send({
        id: 43,
        score: 15,
      });
    expect(res.status).toBe(200);
    done();
  });
});
describe("Successful update of user's Hard score", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request
      .post("/UpdateHardScore")
      .set("Cookie", cookie)
      .send({
        id: 43,
        score: 20,
      });
    expect(res.status).toBe(200);
    done();
  });
});
describe("Successful retrieval of all user's scores", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request.get("/scores").set("Cookie", cookie);
    expect(res.status).toBe(200);
    done();
  });
});
describe("Successful retrieval of all user's for admin manipulation", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request.get("/AdminUserSearch").set("Cookie", cookie);
    expect(res.status).toBe(200);
    done();
  });
});
describe("Successful retrieval of all user's for admin manipulation", () => {
  test("Should respond with a 200 status code", async (done) => {
    const res = await request.get("/UserTypes").set("Cookie", cookie);
    expect(res.status).toBe(200);
    done();
  });
});
