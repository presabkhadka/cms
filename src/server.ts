import express from "express";
import cors from "cors";
import dotnev from "dotenv";
import { userRouter } from "./routes/user.route";

dotnev.config();

const app = express();
app.use(express.json());
app.use(cors());
let port = process.env.PORT;

app.use("/user", userRouter)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
