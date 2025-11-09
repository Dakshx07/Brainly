import express from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import "dotenv/config";
// CORRECT
import { contentModel, linkModel, userModel } from "./db.js";                   
import { JWT_USER_PASSWORD } from "./config.js";                 
import { userSchema } from "./validators/validation.js";            
import bcrypt, { compare } from "bcrypt";
import { userMiddleware } from "./middleware.js";
import { random } from "./utlis.js";
import { hash } from "crypto";

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


app.post("/api/v1/content", userMiddleware, async (req: any, res) => {
  const { link, Type, title } = req.body;

  // VALIDATE INPUT
  if (!link || !Type || !title) {
    return res.status(400).json({
      message: "link, Type, and title are required"
    });
  }

  try {
    const newContent = await contentModel.create({
      link,
      Type,
      title,
      userId: req.userId  // ← THIS IS THE KEY
    });

    return res.json({
      message: "Content created successfully",
      contentId: newContent._id.toString()
    });
  } catch (error: any) {
    console.error("Content error:", error);
    return res.status(500).json({
      message: error.message || "Error creating content"
    });
  }
});

app.get('/api/v1/content/bulk', userMiddleware, async (req: any, res) => {
  try {
    const content = await contentModel.find({ userId: req.userId }).populate("userId","username");

    return res.json({
      content
    });
  } catch (error) {
    console.error("Bulk fetch error:", error);
    return res.status(500).json({
      message: "Error fetching content"
    });
  }
});


app.delete('/api/v1/delete',userMiddleware, async (req: any, res) => {
  const { contentId } = req.body;

  if (!contentId) {
    return res.status(400).json({
      message: 'Content ID is required'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    return res.status(400).json({ message: 'Invalid content ID' });
  }

  try {
    const result = await contentModel.deleteOne({
      _id: new mongoose.Types.ObjectId(contentId),    
      userId: req.userId      
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: 'Content not found or already deleted'
      });
    }

    return res.json({
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      message: 'Error deleting content'
    });
  }
});


app.post('/api/v1/brain/share',async (req: any,res) => {
    const share=req.body.shareLink
   try {
     if(share){
         const existingLinks=await linkModel.findOne({
             userId:req.userId
         })
 
         if(existingLinks){
             return res.json({
                 message:'Link already exists',
                 hash: existingLinks.hash
             })
         }

         const hashLink = random(16)
         await linkModel.create({
            userId:req.userId,
            hash:hashLink
         })
         req.json({
            message:'Updated Link successfully',
            hashLink
         })

     }else{
        await linkModel.deleteOne({
            userId:req.userId
        })

        res.json({
            message:'Link deleted successfully'

        })
     }
     
   } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Something went wrong" });
   }
})

app.post('/api/v1/brain/:shareLink',async (req,res) => {
    const shareLink=req.params.shareLink

    const link=await linkModel.findOne({
        hash
    })

    if(!link){
        return res.status(404).json({
            message:'Link not found'
        })
    }

    const content=await contentModel.findOne({
       userId:link.userId
    })
    const user=await userModel.findOne({
       _id:link.userId
    })

    if(!user){
        return res.status(404).json({
            message:'User not found'
        })
    }

    res.json({
        username:user.username,
        content
    })
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