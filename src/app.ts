import express from "express";
import cors from "cors";
import { router } from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.send("OK");
});

app.use(errorHandler);

export default app;
