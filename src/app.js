import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"// user ke browser se cookies access karne ke liye and set karne ke liye


const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit: "16kb"})) // configuration for json 
app.use(express.urlencoded({extended: true, limit : "16kb"})) //configuration url based data
app.use(express.static("public")) // static folder for images and pdfs
app.use(cookieParser()) // cookie parser middleware

//routes import

import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter)
export{app}
