//quire('dotenv').config({path: './env'})

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });  



//port mongoose from "mongoose";
//port { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import {app} from './app.js'
//import userRoutes from "./routes/user.routes.js"; 


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})

.catch((err) => {
    console.log("MONGO db connection failed !!! " , err);
})