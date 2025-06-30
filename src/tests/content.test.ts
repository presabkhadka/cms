jest.mock("@vinejs/vine");

import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";

dotenv.config();
let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

describe("GET /api/content", () => {
  it("fetches the content", async () => {
    let res = await request(app).get("/api/content");

    expect(res.status).toBe(200);
  }, 15000);
});

describe("PATCH /api/update-content/:contentId", () => {
  it("takes the content id in the params and then update it", async () => {
    let body = {
      slug: "this is a new slug",
    };
    let res = await request(app)
      .patch("/api/update-content/7")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/delete-content/:contentId", () => {
  it("takes the content id as params and deletes the following content", async () => {
    let res = await request(app)
      .delete("/api/delete-content/7")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
