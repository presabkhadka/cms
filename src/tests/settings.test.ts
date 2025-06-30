import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
let token = jwt.sign({ email: "admin@gmail.com" }, process.env.JWT_SECRET!);

describe("POST /api/settings/create", () => {
  it("it creates a settings", async () => {
    let body = {
      key: "jest key",
      value: "jest value",
      group_name: "test group",
    };

    let res = await request(app)
      .post("/api/settings/create")
      .set("Authorization", `Bearer ${token}`)
      .send(body);

    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/settings/update/:settingsId", () => {
  it("it takes the settings id in the params and updates it", async () => {
    let body = {
      key: "new key",
    };

    let res = await request(app)
      .patch("/api/settings/update/3")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe("GET /api/settings", () => {
  it("it fetches the settings", async () => {
    let res = await request(app).get("/api/settings");

    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/settings/delete/:settingsId", () => {
  it("it takes settings id as params and delete that settings", async () => {
    let res = await request(app)
      .delete("/api/settings/delete/3")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
