ts
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use((req, res, next) => {
  const strategistSignature = process.env.STRATEGIST_SIGNATURE;
  // Ensure strategistSignature is a string before setting header
  if (typeof strategistSignature === 'string') {
    req.headers['x-strategist-signature'] = strategistSignature;
  } else {
    console.warn('STRATEGIST_SIGNATURE is not a string or is not set.');
    // Optionally handle cases where the signature is not set or is invalid
  }
  next();
});

app.get('/ping', (req, res) => {
  res.send(`Strategist signature: ${req.headers['x-strategist-signature']}`);
});

// This file serves as a blueprint. You need to integrate this middleware
// into your actual MCP server application.