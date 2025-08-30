const express = require ("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();

const ConnectionRequest = require("../models/connectionRequest")
const user_safe_data = ["firstName", "lastName", "gender"]
//get all pending request for loggedin user 

userRouter.get("/user/request/pending", userAuth, async(req, res) =>{
try {
  const loggedInUser = req.user;

  const connectionRequests = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status: "interested"
  }).populate("fromUserId", ["firstName", "lastName"]);
  res.json({message: "data fetched successfully", data: connectionRequests})
  
} catch (err) {
  res.status(400).send("ERROR: " + err.message)
  
}


});
userRouter.get("/user/haveconnection", userAuth, async(req, res)=>{
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        {toUserId: loggedInUser._id, status: "accepted"},
        {fromUserId: loggedInUser._id, status: "accepted"},
      ],
    }).populate("fromUserId", ["firstName", "lastName"])
    .populate("toUserId", ["firstName", "lastName"])
    const data = connectionRequests.map((row) => {
      if(row.fromUserId._id.toString() === loggedInUser._id.toString())
  {
    return row.toUserId;
  }
  return row.fromUserId;
  })
    res.json({
      message: "data fetched successfully",
      data: data,
    })
  } catch (err) {
    res.status(400).send({message: err.message})
  }
})


//feed api

userRouter.get("/feed", userAuth, async(req, res)=>{
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit>50 ? 50 :limit;
    const skip =(page-1) * limit;
    const connectionRequests = await ConnectionRequest.find({
      $or: [{fromUserId:loggedInUser._id},{toUserId: loggedInUser._id}],
    }).select("fromUserId", "toUserId");
const hideUsersFromFeed = new set();
connectionRequests.forEach((req) => {
  hideUsersFromFeed.add(req.fromUserId.toString()) 
  hideUsersFromFeed.add(req.toUserId.toString()) 
});
const users = await User.find({
  $and: [{_id: {$nin: Array.from(hideUsersFromFeed)}},
          {id: {$ne:loggedInUser._id}}]
}).select(user_safe_data).skip(skip).limit(limit ) ;
 res.send(users)
    
  } catch (err) {
    res.status(400).json({message: err.message})
    
  }
})

module.exports = userRouter