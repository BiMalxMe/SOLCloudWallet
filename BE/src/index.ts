import express, { Request, Response } from "express"
import userModel from "./db";
import jwt  from "jsonwebtoken";
const app = express()

app.use(express.json())

import { z } from "zod";

const userSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

async function validateSignup(req: Request, res: Response, next: Function) {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ msg: result.error.errors.map(e => e.message).join(", ") });
    }
    const existingUser = await userModel.findOne({ username: req.body.username });
    if (existingUser) {
        return res.status(409).json({ msg: "Username already exists" });
    }
    next();
}

async function validateSignin(req: Request, res: Response, next: Function) {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400)
    }
    next();
}

const JWT_SECRET = "123123"
app.post("/signup", validateSignup, async (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;

    await userModel.create({
        username,
        password
    })

    res.json({ msg: "User signed up successfully" })
})

app.post("/signin", validateSignin, async (req: Request, res: Response) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await userModel.findOne({ username })

    if (!user) {
        return res.status(404).json({ msg: "User not found" })
    }

    if (user.password !== password) {
        return res.status(401).json({ msg: "Invalid password" })
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    localStorage.setItem("token",token);
    res.json({
        msg: "User signed in successfully",
        token: token
    })
})

app.listen(3000, () => {
    console.log("Server running on port 3000")
})