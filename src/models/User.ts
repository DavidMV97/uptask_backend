import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    email: string
    password: string
    name: string
    confirmed: boolean
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: {
            type: String,
            required: true
        }
    },
    name: {
        type: {
            type: String,
            required: true
        }
    },
    confirmed: {
        type: {
            type: Boolean,
            default: false
        }
    }
})

const User = mongoose.model<IUser>('User', userSchema)
export default User