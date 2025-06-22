import express, { Request, Response } from "express"
import userModel from "./db";
import jwt  from "jsonwebtoken";
const app = express()
import cors from "cors"
app.use(cors());
app.use(express.json())
app.use(express.json())

import { date, z } from "zod";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import base58 from "bs58";

const userSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

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
async function mainMiddleware(req: Request, res: Response, next: Function) {
    const token = req.headers["authorization"];
    if(!token){
        return res.json({
            msg :"Signin First"
        })
    }
    const data = jwt.verify(token,JWT_SECRET);
    if(!data){
        return res.json({msg :" Correctly signin"})
    }
    // @ts-ignore
    req.userId = data.userId;

    next()


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
    // Set token in response header as 'authorization' (no Bearer, just the token)
    res.setHeader('authorization', token);
    // Also send token in response body for client convenience
    res.json({
        msg: "User signed in successfully",
        token: token
    })
})
app.post("/createwallet", mainMiddleware, async (req, res) => {
    try {
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const privateKey = Buffer.from(keypair.secretKey).toString("base64");

        // Update the existing user with wallet keys
        const updatedUser = await userModel.findByIdAndUpdate(
            // @ts-ignore
            req.userId,
            {
                $set: {
                    publicKey: publicKey,
                    privatekey: privateKey
                }
            },
            { new: true } // return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({
            msg: "Wallet created successfully",
            publicKey,
            privateKey
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});
app.post("/api/v1/txn/sign", mainMiddleware, async (req, res) => {
    const data = req.body;
    const toaddress = data.to;
    const amount = data.amount * LAMPORTS_PER_SOL;

    try {
        // Get the database details
        // @ts-ignore
        const dbdata = await userModel.findOne({ _id: req.userId });
        // const keypairs =  {
        //     publicKey: dbdata?.publicKey,      // Solana wallet address (base58)
        //     secretKey: dbdata?.privatekey  // 64-byte secret key (private + public)
        //   }
        if (!dbdata || !dbdata.publicKey) {
            return res.status(404).json({ msg: "User wallet not found" });
        }

        if (!toaddress || !amount) {
            return res.status(400).json({ msg: "Missing destination address or amount" });
        }

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(dbdata.publicKey),
                toPubkey: new PublicKey(toaddress),
                lamports: Number(amount)
            })
        );
        const pvtkey = dbdata.privatekey;
        if (!pvtkey) {
            return res.status(400).json({ msg: "User private key not found" });
        }
        const keyPair = Keypair.fromSecretKey(Buffer.from(pvtkey, 'base64'));
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.feePayer = new PublicKey(dbdata.publicKey as string);
        transaction.recentBlockhash = blockhash;


        //signinig the transactions
        transaction.sign(keyPair)
        const signature = await connection.sendTransaction(transaction, [keyPair])

    
         res.json({
            msg: "Transaction created successfully",
            sig : signature
        });
         

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});
app.post("/api/v1/txn/", async (req, res) => {
    const signature = req.query.id as string;
// res.json({msg:signature})
    if(!signature) {
    return res.json({
        msg: "Didnot got the signature"
    })
   }

    try {const tx = await connection.getParsedTransaction(signature, {
        commitment: "confirmed" // or "finalized"
      });
      
      if (!tx) {
        return res.status(404).json({ msg: "Transaction not found or not confirmed yet." });
      }
    //   This code checks if a Solana transaction exists and whether it succeeded or
    //    failed. If the transaction isn't found, it returns a 404; if found
    //    , it returns success if meta.err === null, otherwise returns failure.
      if (tx.meta?.err === null) {
        return res.json({ msg: "Transaction successful", tx });
      } else {
        return res.status(200).json({ msg: "Transaction failed", error: tx.meta?.err });
      }
      
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error", error });
    }
});


app.listen(3000, () => {
    console.log("Server running on port 3000")
})