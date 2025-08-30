import { Schema, model, mongo } from "mongoose";


const userSession = new Schema({
  interview: {
    type: Schema.Types.ObjectId,
    ref: "Interview",
    required: true,
  },
  state: {
    type: String,
    enum: ["active", "ended"],
    default: "active",
  },
  link: { 
    type : String , 
    required: true ,
  },
  results: {
    type: String,
  },
 
 } , {timestamps : true } );

 const UserSession = model('UserSession' , userSession) ;
 export default UserSession  ;