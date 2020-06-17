const mongoose=require('mongoose');


const img_schema=new mongoose.Schema({
    
    data: Buffer,
     contentType: String 

})

const Img =mongoose.model('img',img_schema);

module.exports= Img;