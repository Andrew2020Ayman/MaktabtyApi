const mongoose=require('mongoose');
let img = require('../models/img');

const Book_schema=new mongoose.Schema({
    
    BookName :{ 
      type : String,
      require: true,
      trim:true,
    },
    BookAuther :{ 
      type : String,
      require: true,
      trim:true,
    },
    BookDes:{
      type:String,
      required:true,
      trim:true
    },
    BookPrice:{
      type:String,
      required:true,
      trim:true
    },
    BookImg :{
      type :{img}
    }

})

const Book =mongoose.model('book',Book_schema);

module.exports= Book;