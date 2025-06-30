// __mocks__/userMiddleware.ts

import { type Request, type Response, NextFunction } from "express";

module.exports = (req: Request, res: Response, next: NextFunction) => {
  req.user = "admin@gmail.com"; // 👈 mock the email directly
  next();
};
