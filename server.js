const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
require("dotenv").config();
const { OpenAI } = require('openai');
const stripe = require("stripe")(process.env.STRIPE);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const path = require("path");

const app = express();
const port = process.env.PORT;
const axios = require("axios");

const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "data/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${basename}$ext`);
  },
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.post("/assistant", async (req, res) => {
  const userMessage = req.body.userPrompt;

  try {
    const response = await generateAssistantResponse(userMessage);

    res.send(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing message");
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});

async function generateAssistantResponse(userMessage) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          { "role": "system", "content": "If asked say that you're talking through a Node.js server made by Alexis, a software developer." },
          { "role": "user", "content": userMessage }],
        max_tokens: 1000
      });
      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating GPT-3 response:', error);
      throw new Error('Error generating response');
    }
  }
