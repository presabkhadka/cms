import { app } from "./server";
import dotenv from "dotenv";

dotenv.config();

let port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
