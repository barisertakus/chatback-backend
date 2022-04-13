const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0byup.mongodb.net/chatback?retryWrites=true&w=majority`, ()=> {
  console.log("Connected to MongoDB");
})
