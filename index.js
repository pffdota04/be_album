const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require("cookie-parser");
app.listen(5000, () => console.log("Server is running"));
// ADD THIS
var cors = require("cors");
// app.use(cors());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://tuankiet:kietkiet00@tuankiet.jjjqi.mongodb.net/example?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userRoutes = require("./route/user/userRoute");
const imageRoutes = require("./route/image/imgRoute");
const alBumRoutes = require("./route/album/albumRoute");

app.use("/user", userRoutes);
app.use("/image", imageRoutes);
app.use("/album", alBumRoutes);
