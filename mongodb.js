const mongoose = require("mongoose");

const mongoConntect = () => {
  try {
    mongoose.connect(
      "mongodb+srv://tuankiet:kietkiet00@tuankiet.jjjqi.mongodb.net/example?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = mongoConntect;
