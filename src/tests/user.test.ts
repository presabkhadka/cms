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
      name: "test",
      email: "test1@gmail.com",
      password: "test1234",
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
  });
});

describe("POST /api/login", () => {
  it("should create a token and send the token in response", async () => {
    let body = {
      email: "admin@gmail.com",
      password: "admin1234",
    };

    let res = await request(app).post("/api/login").send(body);

    console.log("Response status:", res.status);
    console.log("Response body:", res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
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
  });
});

describe("PATCH /api/update-details/:userId", () => {
  it("should update the user details", async () => {
    let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

    let body = {
      name: "hero",
    };

    let res = await request(app)
      .patch("/api/update-details/5")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/delete/:userId", () => {
  it("should take the user id in the params and delete the user", async () => {
    let token = jwt.sign({ email: "test1@gmail.com" }, process.env.JWT_SECRET!);

    let res = await request(app)
      .delete("/api/delete/7")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
