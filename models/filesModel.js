const mongoose = require('mongoose');
const  fileSchema=new mongoose.Schema({
    filename:{
        type:Strring,
        required:true,
    },
    uplodedby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
    
})
const File=mongoose.model("files", fileSchema)