const mongoose = require('mongoose');

const db = async () =>{
    try{

        await mongoose.connect(process.env.DB_URI)
        console.log("DB Connected Successfully")
    }catch( error ){
        console.log("DB Connection Error")
    }

}

module.exports = db