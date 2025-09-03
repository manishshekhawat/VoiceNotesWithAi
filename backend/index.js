const express = require("express");
const mongoose= require("mongoose");
const cors=require("cors");
const Router = require("./Routes/noteRoutes");

require("dotenv").config({quiet:true});

const app=express();

app.use(cors());
app.use(express.json());

const PORT=process.env.PORT;
const MONGODB_URL=process.env.MONGODB_URL;

mongoose.connect(MONGODB_URL).then(()=>{
    console.log("Database is connected successfully");
    app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})
}).catch((e)=>{
    console.log("Database is not connected",e);
})

app.use("/api/notes", Router);


