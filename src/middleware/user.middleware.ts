import { type Request, type Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";

dotenv.config();
const client = new PrismaClient();

export default async function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(400).json({
        msg: "Authorization headers missing",
      });
      return;
    }

    let decoded = await jwt.verify(token, process.env.JWT_SECRET!);
    let email = (decoded as jwt.JwtPayload).email;

    let existingUser = await client.users.findFirst({
      where: {
        email,
      },
    });

    if (!existingUser) {
      res.status(403).json({
        msg: "No such user found in our db",
      });
      return;
    }

    // @ts-ignore
    req.user = email;
    next();
  } catch (error) {
    res.status(500).json({
      msg:
        error instanceof Error
          ? error.message
          : "Something went wrong with the server",
    });
  }
}
