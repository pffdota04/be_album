const express = require("express");
const app = express();
app.listen(5000, () => console.log("Server is running"));
app.use(express.json());
// ADD THIS
var cors = require("cors");
app.use(cors());

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
