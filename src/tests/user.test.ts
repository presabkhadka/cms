import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "../server";
import vine from "@vinejs/vine";
import { createUserSchema } from "../validators/createUser";

describe("POST /signup", () => {
  it("should signup the user and hash the pw", async () => {
    // let payload = await vine.validate({
    //   schema: createUserSchema,
    //   data:
    // });
    // let { name, email, password, avatar, status } = payload;
    const res = await request(app)
      .post("/signup")
      .send({
        name: "test",
        email: "test@gmail.com",
        password: "test1234",
        avatar: "test.png",
        status: "ACTIVE",
        UserRoles: {
          role_id: 1,
        },
      });
    expect(res.status).toBe(200);
  });
});
