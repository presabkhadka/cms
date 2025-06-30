jest.mock("@vinejs/vine");

import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import dotenv from "dotenv";

dotenv.config();

describe("GET /api/roles", () => {
  it("fetches the roles", async () => {
    let res = await request(app).get("/api/roles");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("roles");
  });
});

describe("GET /api/all-users", () => {
  it("fetches all the users and sends the details in response", async () => {
    let res = await request(app).get("/api/all-users");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
  });
});
