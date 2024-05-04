const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
require("dotenv").config();
const { OpenAI } = require("openai");
const stripe = require("stripe")(process.env.STRIPE);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const cors = require("cors");
const UserDatabase = require("./UserDatabase.js");
const DiscountDatabase = require("./DiscountsDatabase.js");
const usersDB = new UserDatabase("./data/users.json");
const discountDB = new DiscountDatabase("./data/discounts.json");
const path = require("path");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const validateToken = require("./middleware/tokenvalidator.js")


const app = express();
app.use(cors());
const port = process.env.PORT;

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
  if (file.mimetype === "application/json") {
    console.log("json accepted");
    cb(null, true);
  } else {
    console.log("json not accepted");
    cb(new Error("Only JSON files are allowed"), false);
  }
};
const upload = multer({ storage, fileFilter });

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
app.get("/users", async (req, res) => {
  const usersData = await usersDB.getUsers();
  res.json(usersData);
});
app.post("/users", async (req, res) => {
  const newUser = req.body;
  console.log(newUser + " in server apppost")
  
  const addUser = await usersDB.addUser(newUser);
  if (addUser) {
    res.send({ message: "User added successfully!",user:addUser.user});
  }
  else{
    res.status(400).send({message:"Bad request!"})
  }
});
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const usersData = await usersDB.getUserById(id);
  res.json(usersData);
});
app.delete("/users", async (req, res) => {
  const id = req.body.id;
  console.log(id);
  const deleteUser = await usersDB.deleteUserById(id);
  if (deleteUser) {
    res.send({ message: "User deleted!" });
  }
  else {
    res.status(400).send({message:"Bad request!"})
  }
});
app.get("/discounts", async (req, res) => {
  const discountData = await discountDB.getDiscounts()
  res.send(discountData)
});
app.post("/assistant", async (req, res) => {
  const userMessage = req.body.userPrompt;
  console.log(req.body);

  try {
    const response = await assistantModifyDiscounts(userMessage);
    const queryResult = await eval(response)
    
    console.log(response)
    
    res.send({ message: queryResult });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing message");
  }
});
app.post("/payment", async (req, res) => {
  const { amount, currency, source } = req.body;
  console.log(req.body);

  try {
    const charge = await stripe.charges.create({ amount, currency, source });

    res.status(200).send({ message: "Payment sucessful!", charge });
  } catch (error) {
    res.status(500).send({ message: "Payment failed!", error });
  }
});
app.post("/discount", async (req, res) => {
  
  const { brand, cards, apps, discount, code } = req.body;
  
  const addDiscount = await discountDB.addDiscount(brand, cards, apps, discount, code);
  if (addDiscount) {
    res.send({ message: "Discount added successfully!",discount:addDiscount});
  }
  else{
    res.status(400).send({message:"Bad request!"})
  }
});
app.post("/login",async (req,res)=>{
  const {username,password} = req.body
  if (!username || !password){
      res.status(400).send({message:"Missing email or password."})
      }
    const user = usersDB.getUserByUsername(username)
    const isPasswordCorrect = await bcrypt.compare(password,user.password)
    if (!isPasswordCorrect){
      res.status(200).send({message:"Wrong Password!"})
    }
    else{

      res.status(200).send({message:"Login sucessful!"})
    }
})
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
            "I'm a database assistant. I follow a very strict conversation flow. I always greet the user and ask their name in the language they used.",
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

async function assistantGeneratedQuery(userMessage) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            `I'm a database assistant. The user will ask me questions about a database. I have access to these methods: discountDB.findBrandWithApp(appName),discountDB.findBrandWithCard(cardName) Choose the appropriate function and only respond with the function and the corresponding argument. Not even backticks.
            Example 1:
            User: I have the card chickenCard.
            Assistant: discountDB.findBrandWithCard("chickenCard")
            Example 2:
            User: I have the app clubApp.
            Assistant: discountDB.findBrandWithApp("clubApp")
          `,
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
async function generateResponseAfterQuery(queryResults) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            `I'm a database assistant. This database stores the apps and cards you need to get discounts for each brand. My job is to give the results to the user in a natural way. These are the results of the query ${JSON.stringify(queryResults)}`,
        }
      ],
      max_tokens: 1000,
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating GPT-3 response:", error);
    throw new Error("Error generating response");
  }
}
async function assistantModifyDiscounts(userMessage) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            `I'm a database assistant. The user will try to add discounts to the database. I have access to these methods: discountDB.addDiscount(brand, cards, apps, discount, code) Choose the appropriate method and only respond with the method and the corresponding argument. Not even backticks.
            Example 1:
            User: I want to add the following discount. Mcdonalds, card burgerSuper, app foodRewardz, discount 15%
            Assistant: discountDB.addDiscount("Mcdonalds", ["burgerSuper"], ["foodRewardz"], 15)
            Example 2:
            User: I want to add the following discount. NIKE, runningCard, NikeApp, discount 22%, code NIKE25
            Assistant: discountDB.addDiscount("Nike", ["runningCard"], ["NikeApp"], 22, "NIKE25");
          `,
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
