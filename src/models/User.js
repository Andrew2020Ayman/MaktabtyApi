const mongoose=require('mongoose');
const Book = require('./Book')

const User_schema=new mongoose.Schema({
    
  Firstname :{ 
      type : String,
      require: true,
      trim:true,
    },
    LastName :{ 
        type : String,
        require: true,
        trim:true,
      },
    MyBooks :{ 
        type : {Book},
        require: true,
        trim:true,
      },
     LoginID:{
      type:String,
      required:true,
      trim:true
    } 
   
})

const User =mongoose.model('user',User_schema);

module.exports=User;