import mongoose,{model,Schema} from 'mongoose'

const ObjectId=mongoose.Types.ObjectId

const userSchema=new Schema({
    username:{type: String, required: true, unique: true},
    password:{type:String,required: true}
})

const contentTypes=['image', 'video', 'article', 'audio']
const contentSchema=new Schema({
    link:{type:String,required: true},
    Type: {type:String,enum:contentTypes,required: true},
    title:{type:String,required: true},
    tags:[{type:ObjectId,ref:'Tags'}],
    userId:{
        type:ObjectId,
        ref:'User',
        required:true
    }

})

const tagsSchema=new Schema({
    title:{type:String,required: true, unique:true}
})

const linkSchema=new Schema({
    hash:{type:String,required: true, unique:true},
    userId:{
        type:ObjectId,
        ref:'User',
        required:true,
        unique:true,
    }
})

export const userModel=mongoose.model('User',userSchema)
export const contentModel=mongoose.model('Content',contentSchema)
export const tagsModel=mongoose.model('Tags',tagsSchema)
export const linkModel=mongoose.model('Link',linkSchema)



