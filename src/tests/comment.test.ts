import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

describe("POST /api/content/:contentId/comments", () => {
  it("this takes a content id in the params and then creates a comment for that particular content", async () => {
    let body = {
      comment: "comment testing, jest",
      status: "PENDING",
      user_id: 4,
    };

    let res = await request(app)
      .post("/api/content/5/comments")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(200);
  });
});

describe("GET /api/content/:contentId/comments", () => {
  it("this takes the content id as parmas and returns all the approved comments of that content", async () => {
    let res = await request(app)
      .get("/api/content/5/comments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/comment/approve/:commentId", () => {
  it("this takes comment id in params and approve that comment if it is not approved", async () => {
    let res = await request(app)
      .patch("/api/comment/approve/8")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/comment/reject/:commentId", () => {
  it("this takes comment id in parmas and reject that comment", async () => {
    let res = await request(app)
      .patch("/api/comment/reject/9")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/comment/delete/:commentId", () => {
  it("this takes the comment id in params and deletes that comment", async () => {
    let res = await request(app)
      .delete("/api/comment/delete/10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
