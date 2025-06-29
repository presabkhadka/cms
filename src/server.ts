import express from "express";
import cors from "cors";
import dotnev from "dotenv";
import { userRouter } from "./routes/api.route";

dotnev.config();

export const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRouter);
