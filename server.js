const express=require("express");
const fs=require("fs");
const path=require("path");

const app=express();
app.use(express.static(__dirname));

app.get("/songs",(req,res)=>{
  try{
    res.json(fs.readdirSync(path.join(__dirname,"songs")).filter(f=>/\.(mp3|wav|ogg)$/.test(f)));
  }catch{
    res.json([]);
  }
});

app.listen(5500);
