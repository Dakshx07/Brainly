import express from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import "dotenv/config";
// CORRECT
import { contentModel, userModel } from "./db.js";                    // .ts file
import { JWT_USER_PASSWORD } from "./config.js";                  // .js file
import { userSchema } from "./validators/validation.js";             // .ts file
import bcrypt from "bcrypt";
import { createHash } from "crypto";

const app=express()
app.use(express.json())

const PORT=process.env.PORT || 3000

app.post('/api/v1/signup',async (req,res) => {
    const parsed=userSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ 
            message: parsed.error.issues[0]?.message || "Validation failed" 
    });
}


    const {username, password}=parsed.data
    if(!username || !password){
        return res.status(400).json({
            message:'Username and password are required'
        })
        
    }

    try {
        const hashedPassword=await bcrypt.hash(password,10)
        await userModel.create({
            username:username,
            password:hashedPassword
        })

        res.json({
            message:'User created successfully'
        })
    } catch (error) {
        res.status(500).json({
            message:'Error creating user'
        })
    }
})

app.post('/api/v1/signin', async (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ 
      message: parsed.error.issues[0]?.message || "Validation failed" 
    });
  }

  const { username, password } = parsed.data;
  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required'
    });
  }

  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign(
      { _id: user._id.toString() },
      JWT_USER_PASSWORD,
      { expiresIn: '1h' }
    );

    return res.json({ token });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/v1/content", async (req, res) => {
  console.log("CONTENT ROUTE HIT:", req.body);

  const { link, Type, title, userId } = req.body;

  if (!link || !Type || !title || !userId) {
    return res.status(400).json({
      message: "link, Type, title, and userId are required"
    });
  }

  try {
    await contentModel.create({
      link,
      Type,
      title,
      userId
    });
    return res.json({ message: "Content created successfully" });
  } catch (error: any) {
    console.error("Content error:", error);
    return res.status(500).json({ 
      message: error.message || "Error creating content" 
    });
  }
});

//to bring all the content of a user in bulk
app.get('/api/v1/content/bulk',async (req,res) => {
    const {link,Type,title,tags} = req.body
    if(!link || !Type || !title || !tags){
        res.status(400).json({
            message:'Link, Type, title and tags are required'
        })
    }

    try {
        
    } catch (error) {
        
    }
})



app.delete('/api/v1/delete',async (req,res) => {
    const {userId} = req.body

    if(!userId){
        res.status(400).json({
            message:'User ID is required'
        })
    }

    try {
        await contentModel.deleteOne({userId:userId})

        res.json({
            message:'Content deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            message:'Error deleting content'
        })
    }
})


app.post('/api/v1/brain/share',(req,res) => {
    const {userId, hash}= req.body
})

app.post('/api/v1/brain/:shareLink',(req,res) => {

})

async function main(){
    const mongoUrl=process.env.MONGO_URL
    if(!mongoUrl){
        console.error("❌ MongoDB URL not found in .env file")
        return
    }

    try {
        await mongoose.connect(mongoUrl)
        app.listen(PORT,()=>{
            console.log('Server is running on port 3000')
        })
    } catch (e) {
         console.error("❌ MongoDB connection failed:");
    }
}

main()