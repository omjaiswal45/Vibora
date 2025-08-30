const mongoose = require ("mongoose");

const connectDB = async () =>{
  await mongoose.connect("mongodb+srv://omjai11022000:Sbi123al@cluster0.xquzjzr.mongodb.net/devtinderDB")
};

module.exports =connectDB

