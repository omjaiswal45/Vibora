const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
  fromUserId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  toUserId:{
    type:mongoose.Schema.Types.ObjectId, 
    required:true,
    ref: "User"
  },
  status:{
    type:String,
    required: true,
    enum: {
      values:["ignored","interested", "accepted", "rejected"],
     message: `{value} is incorrect status types`
    
  }
}
},
{timestamps: true});

connectionRequestSchema.index({fromUserId: 1, toUserId: 1})

connectionRequestSchema.pre("save", function(next){
 const connectionRequest = this;
 //check if the fromuserid is same as touserId
 if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
  throw new Error("cannot send connection request to yourself")
 }
 next();
})

const connectionRequest = new mongoose.model("connectionRequest",connectionRequestSchema );

module.exports = connectionRequest;