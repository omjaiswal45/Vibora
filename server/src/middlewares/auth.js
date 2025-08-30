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
const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const decoded = jwt.verify(token, "Jassu@123al");
    const user = await User.findById(decoded._id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
module.exports ={
  adminAuth,
  userAuth,
}; 