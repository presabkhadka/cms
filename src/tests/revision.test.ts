import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

describe("GET /api/content/:contentId/revisions", () => {
  it("this takes a content id in params and it fetches all the revision of a content", async () => {
    let res = await request(app)
      .get("/api/content/5/revisions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("revisions");
  }, 15000);
});

describe("GET /api/revision/:revisionId", () => {
  it("this take a revision id in params and fetches the details of that particular revision", async () => {
    let res = await request(app)
      .get("/api/revision/4")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("revisions");
  }, 15000);
});
