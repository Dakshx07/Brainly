import mongoose, { model, Schema, Types } from 'mongoose';

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false }, // Password should not be selected by default
});

const contentTypes = ['image', 'video', 'article', 'audio'] as const;
const contentSchema = new Schema({
    link: { type: String, required: true, trim: true },
    Type: { type: String, enum: contentTypes, required: true },
    title: { type: String, required: true, trim: true },
    tags: [{ type: Types.ObjectId, ref: 'Tags' }],
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const tagsSchema = new Schema({
    title: { type: String, required: true, unique: true, trim: true },
});

const linkSchema = new Schema({
    hash: { type: String, required: true, unique: true, trim: true },
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
});

export const userModel = model('User', userSchema);
export const contentModel = model('Content', contentSchema);
export const tagsModel = model('Tags', tagsSchema);
export const linkModel = model('Link', linkSchema);