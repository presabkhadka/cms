import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUserSchema } from "../validators/createUser";
import vine from "@vinejs/vine";
import { PrismaClient } from "../generated/prisma";
import dotenv from "dotenv";

dotenv.config();

const client = new PrismaClient();

export async function userSignup(req: Request, res: Response) {
  try {
    const payload = await vine.validate({
      schema: createUserSchema,
      data: req.body,
    });

    let { name, email, password, avatar, status } = payload;

    let existingUser = await client.users.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(409).json({
        msg: "User already exists with that email",
      });
      return;
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    await client.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar,
        status,
      },
    });

    res.status(200).json({
      msg: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong in the server",
    });
  }
}

export async function userLogin(req: Request, res: Response) {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        msg: "Input fields cannot be left empty",
      });
      return;
    }

    let existingUser = await client.users.findFirst({
      where: {
        email,
      },
    });

    if (!existingUser) {
      res.status(404).json({
        msg: "No such user found in our db",
      });
      return;
    }

    let passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      res.status(409).json({
        msg: "Incorrect credentials, Please try again later",
      });
      return;
    }

    let token = await jwt.sign(password, process.env.JWT_SECRET!);

    res.status(200).json({
       token,
    });
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}
