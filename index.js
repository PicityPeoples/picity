const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const projectRoute = require("./routes/projects");
const certificateRoute = require("./routes/certificates");
const experienceRoute = require("./routes/experience");
const conversationRoute = require("./routes/conversations");
const clubsupdateRoute = require("./routes/clubs");
const opportunityRoute = require("./routes/opprotunity");
const messageRoute = require("./routes/messages");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox9c3d5b46ad5f4e20bc359a158f356f92.mailgun.org";
const mg = mailgun({
  apiKey: "4c31c759fe6e23f16f8501c26c0adada-e2e3d8ec-cd60d513",
  domain: DOMAIN,
});

dotenv.config();

try {
  mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, () => {
    console.log("Connected to MONGODB");
  });
} catch (err) {
  console.log(err);
}

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/projects", projectRoute);
app.use("/api/experience", experienceRoute);
app.use("/api/certificates", certificateRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/opportunity", opportunityRoute);
app.use("/api/messages", messageRoute);
app.use("/api/clubupdates", clubsupdateRoute);
app.use("/images", express.static(path.join(__dirname, "/images")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested, Content-Type, Accept Authorization"
  )
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "POST, PUT, PATCH, GET, DELETE"
    )
    return res.status(200).json({})
  }
  next()
})

app.use(cors({ origin: "https://pictpeoples.herokuapp.com/auth/login", credentials: true }))




// middleware

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (err) {
    console.log(err);
  }
});

app.post("/sendmail", cors(), async (req, res) => {
  const { text, mail } = req.body;
  // const transport = nodemailer.createTransport({
  //   host: process.env.MAIL_HOST,
  //   port: process.env.MAIL_PORT,
  //   auth: {
  //     user: process.env.MAIL_USER,
  //     pass: process.env.MAIL_PASS,
  //   },
  // });
  const data = {
    from: "picitypicity7@gmail.com",
    to: mail,
    subject: "Email Verfication",
    text: `${text}`,
  };
  try{
    mg.messages().send(data, function (error, body) {
      console.log(error);
      console.log(data);
      console.log("Sent successfully")
    });
  }catch(err){
    console.log(err);
  }

  // const transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   auth: {
  //     user: "bertrand.cummerata27@ethereal.email",
  //     pass: "ZYZ4GkMQR1UNUgs13c",
  //   },
  // });
  // try {
  //   await transporter.sendMail({
  //     from: process.env.MAIL_FROM,
  //     to: mail,
  //     subject: "Verification OTP",
  //     html: `${text}`,
  //     text: `${text}`,
  //   });
  //   res.status(200).json("Sent successfully");
  // } catch (err) {
  //   console.log(err);
  // }
});
app.get('/',(req,res)=>{
  res.send("App is running");
})
app.listen(process.env.PORT || 5000 , () => {
  console.log("Backend is running!");
});
