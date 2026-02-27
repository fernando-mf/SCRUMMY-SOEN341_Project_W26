import "dotenv/config";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { NewCore } from "@api/core";
import { ErrorMiddleware } from "./middleware";
import { Routes } from "./routes";
import "express-async-errors";

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
app.use(ErrorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;

// Start server locally in development mode
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
