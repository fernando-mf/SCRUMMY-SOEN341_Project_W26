"use strict";

const path = require("path");

// Load the built Express app from backend (built during Vercel build step)
const backendPath = path.join(__dirname, "..", "backend", "dist", "http", "index.js");
const backend = require(backendPath);
const app = backend.app;

module.exports = (req, res) => app(req, res);
