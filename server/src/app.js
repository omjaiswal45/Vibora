const express = require("express")
const cookieParser = require('cookie-parser')
const app = express();
const connectDB = require("./config/database")
const cors = require("cors")
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin: "https://vibora-sepia.vercel.app",
  credentials: true,
}))
const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const connectionRouter = require("./routers/connection");
const postRouter = require("./routers/post");
const feedRouter = require("./routers/feed");
const messageRouter = require("./routers/message");


app.use("/", authRouter);
app.use("/", profileRouter);

app.use("/", connectionRouter);
app.use("/", postRouter);
app.use("/", feedRouter);
app.use("/", messageRouter);

connectDB().then(() =>{
  console.log("db conn established....")
  app.listen(4000, () =>{
  console.log("server is running at http://localhost:4000/")
});
})
.catch((err) =>{
  console.log("db is not be connected")
})


