import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { JWT_USER_PASSWORD } from "./config.js";
export const userMiddleware = (req: Request,res : Response,next : NextFunction) => {
    const token=req.headers['authorization']

    if(!token){
        return res.status(401).json({
            message:'No token provided'
        })
    }

    try {
        const decode=jwt.verify(token,JWT_USER_PASSWORD) as {_id:string}
        //@ts-ignore
        req.userID = decode._id
        next()
    } catch (error) {
        return res.status(401).json({
            message:'Invalid token'
        })
    }
}