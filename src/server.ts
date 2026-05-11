import dotenv from "dotenv";
import express, { Request, Response } from "express";
import app from "./app";

dotenv.config();

const port = Number(process.env.PORT) || 8800;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
