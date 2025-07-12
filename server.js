const express = require("express");
const app = express();
require("dotenv").config();
app.all("/",(req,res)=>{
    res.send("All is Well")
})

function keepAlive(){
    app.listen(process.env.PORT || 3000,(req,res)=>{
        console.log("Shit is Running.")
    })
}

module.exports = {
    keepAlive
}