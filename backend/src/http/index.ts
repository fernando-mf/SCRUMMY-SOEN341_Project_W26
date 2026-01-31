import "dotenv/config";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { NewCore } from "@api/core";
import { Routes } from "./routes";

// Initialize app core
const core = NewCore();

// Initialize express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", Routes(core));

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
