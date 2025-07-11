const express = require("express");
const app = express();

app.all("/",(req,res)=>{
    res.send("All is Well")
})

function keepAlive(){
    app.listen(3000,(req,res)=>{
        console.log("Shit is Running.")
    })
}

module.exports = {
    keepAlive
}