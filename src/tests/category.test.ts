jest.mock("@vinejs/vine");

import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

describe("POST /api/add-category", () => {
  it("it should create a new category", async () => {
    let body = {
      name: "fiction",
      description: "this is wonderful",
      parent_id: null,
    };

    const res = await request(app)
      .post("/api/add-category")
      .send(body)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  }, 15000);
});

describe("GET /api/category", () => {
  it("should fetch the cateogry", async () => {
    let res = await request(app).get("/api/category");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("categories");
  }, 15000);
});

describe("PATCH /api/update-category/:categoryId", () => {
  it("takes the category id in the params and updates the changes", async () => {
    let body = {
      name: "Maths",
    };

    let res = await request(app)
      .patch("/api/update-category/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  }, 15000);
});

describe("DELETE /api/delete-category/:categoryId", () => {
  it("takes the category id in the params and deletes the changes", async () => {
    let res = await request(app)
      .delete("/api/delete-category/4")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  }, 15000);
});
