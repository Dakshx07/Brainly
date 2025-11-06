
import { z } from "zod";

export const userSchema=z.object({
    username: z.string().min(3, "Username too short").max(30, "Username too long"),
  password: z.string().min(8, "Password too short").max(20, "Password too long"),
})

export const contentSchema=z.object({
    link:z.string().url(),
    Type:z.enum(['image', 'video', 'article', 'audio']),
    title:z.string().min(5).max(30),
    tags:z.array(z.string()).optional(),
    userId:z.string(),
})

export const tagsSchema=z.object({
   title:z.string().min(2).max(30),
})

export const linkSchema=z.object({
    hash:z.string().min(3),
    userID:z.string()
})



