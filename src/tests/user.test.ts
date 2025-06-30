jest.mock("@vinejs/vine");

import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import vine from "@vinejs/vine";
import { createUserSchema } from "../validators/createUser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userMiddleware from "../middleware/user.middleware";
import dotenv from "dotenv";

dotenv.config();

describe("POST /api/signup", () => {
  it("should signup the user and hash the pw", async () => {
    let body = {
      name: "jest",
      email: "jest@gmail.com",
      password: "jest1234",
      avatar: "test.png",
      status: "ACTIVE",
      UserRoles: {
        role_id: 1,
      },
    };

    let payload = await vine.validate({
      schema: createUserSchema,
      data: body,
    });

    let hashedPass = await bcrypt.hash(body.password, 10);
    body.password = hashedPass;

    const res = await request(app).post("/api/signup").send(body);
    expect(res.status).toBe(200);
  }, 15000);
});

describe("POST /api/login", () => {
  it("should create a token and send the token in response", async () => {
    let body = {
      email: "admin@gmail.com",
      password: "admin1234",
    };

    let res = await request(app).post("/api/login").send(body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  }, 15000);
});

describe("GET /api/details", () => {
  it("should provide the details of the user", async () => {
    let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

    let res = await request(app)
      .get("/api/details")
      .set("Authorization", `Bearer ${token}`);

    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("userDetails");
  }, 15000);
});

describe("PATCH /api/update-details/:userId", () => {
  it("should update the user details", async () => {
    let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

    let body = {
      name: "messi",
    };

    let res = await request(app)
      .patch("/api/update-details/5")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(200);
  }, 15000);
});

describe("DELETE /api/delete/:userId", () => {
  it("should take the user id in the params and delete the user", async () => {
    let token = jwt.sign({ email: "test2@gmail.com" }, process.env.JWT_SECRET!);

    let res = await request(app)
      .delete("/api/delete/10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  }, 15000);
});
