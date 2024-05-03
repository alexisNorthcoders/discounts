const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
require("dotenv").config();
const { OpenAI } = require("openai");
const stripe = require("stripe")(process.env.STRIPE);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cors = require('cors')


const path = require("path");

const app = express();
app.use(cors())
const port = process.env.PORT;

const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "data/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${basename}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/json') {
    console.log("json accepted")
    cb(null, true);
  } else {
    console.log("json not accepted")
    cb(new Error('Only JSON files are allowed'), false);
  }
};
const upload = multer({ storage,fileFilter});

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
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    req.session.filePath = req.file.path;
    res.status(200).send({ message: "File uploaded successfully." });
  } catch (error) {
    res.status(500).send({ message: "Failed uploading the file.", error });
  }
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.post("/assistant", async (req, res) => {
  const userMessage = req.body.userPrompt;
  console.log(req.body)

  try {
    const response = await generateAssistantResponse(userMessage);
    console.log(response)
    res.send({message:response});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing message");
  }
});

app.post("/payment", async (req, res) => {
  const { amount, currency, source } = req.body;

  try {
    const charge = await stripe.charges.create({ amount, currency, source });

    res.status(200).send({ message: "Payment sucessful!", charge });
  } catch (error) {
    res.status(500).send({ message: "Payment failed!", error });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});

async function generateAssistantResponse(userMessage) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            "If asked say that you're talking through a Node.js server made by Alexis, a software developer.",
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1000,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating GPT-3 response:", error);
    throw new Error("Error generating response");
  }
}
