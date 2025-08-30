const jwt = require("jsonwebtoken");
const User = require("../models/user")


const adminAuth = (req, res, next) =>{
  console.log("yes middleware work here for admin")
  const token = "abc"
  const isAdminAuthorized = token ==="abc";
  if(!isAdminAuthorized){
    res.status(404).send("unauthorized request")
  }
  else{
    next();
  }
};

// user Auth....................................
const userAuth = async (req, res, next) =>{
try {
  //findout the token from res
  const{token} = req.cookies;
  if(!token){
    throw new Error("token is not valid!!!")
  }
  //validate the token------------------
  const decodeObj = await jwt.verify(token, "Jassu@123al")
  const {_id} = decodeObj;
  //find out the user from database-------------
  const user = await User.findById(_id);
  if(!user){
    throw new Error("user not found")
  }
  req.user = user;
  next();
} catch (err) {
  res.status(400).send("ERROR: " + err.message)
  
}
};


module.exports ={
  adminAuth,
  userAuth,
}; 