import "dotenv/config";
import express,{Request,Response} from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "./generated/prisma/client.js";
import jwt from "jsonwebtoken";
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
const PORT = 3000;

type HealthResponse ={status:"ok" ;time: string};

app.get("/health",(req: Request, res: Response<HealthResponse>) =>{
    res.json({status:"ok",time:new Date().toISOString()});
});
app.post("/auth/signup", async (req: Request, res: Response) => {
    try{
        const {name, email ,password} =req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data:{name, email,password: hashedPassword},
        });
        res.json({ id: user.id, name:user.name,email:user.email});
    }catch (error){
        console.error(error)
        res.status(400).json({error:"Could not create user try again"});
    }
});
app.post("/auth/login", async (req: Request, res: Response) => {
 try{
     const {email ,password}= req.body;
     const user= await prisma.user.findUnique({where:{email}});
     if (!user){
         return res.status(401).json({error:"Invalid email or password Sign Up to create"})
     }
     const passwordMatches = await bcrypt.compare(password, user.password);
     if (!passwordMatches){
         return res.status(401).json({error:"Invalid email or password Sign Up to create"});
     }
     const token = jwt.sign(
         { userId:user.id},
         process.env.JWT_SECRET as string,
         {expiresIn:"7d"}
     );
     res.json({token,user:{id:user.id,name:user.name,email:user.email}});
 } catch (error){
     console.error(error)
     res.status(400).json({error:"Could not log in. Sign Up first"});
 }
});

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});