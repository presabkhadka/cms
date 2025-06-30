jest.mock("@vinejs/vine");

import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import dotenv from "dotenv";
import vine from "@vinejs/vine";
import jwt from "jsonwebtoken";

dotenv.config();
let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

describe("POST /api/add-tag", () => {
  it("creates a tag", async () => {
    let body = {
      name: "tag1",
      slug: "this is a slug",
    };

    let res = await request(app)
      .post("/api/add-tag")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("GET /api/tag", () => {
  it("fetches the tag", async () => {
    let res = await request(app).get("/api/tag");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tags");
  });
});

describe("DELETE /api/delete-tag/:tagId", () => {
  it("take a tag id from the params and then deletes the following tag", async () => {
    let res = await request(app)
      .delete("/api/delete-tag/3")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  }, 15000);
});

describe("PATCH /api/update-tag/:tagId", () => {
  it("takes a tag id from the params and then updates the following tag", async () => {
    let body = {
      name: "newtag",
    };

    let res = await request(app)
      .patch("/api/update-tag/2")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  }, 15000);
});
