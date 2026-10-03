import "dotenv/config";
import express,{Request,Response} from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "./generated/prisma/client.js";

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
app.post("/auth/login", (req: Request, res: Response) => {
  res.json({ message: "login endpoint hit" });
});
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});