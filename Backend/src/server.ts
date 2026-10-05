import "dotenv/config";
import express,{Request,Response,NextFunction} from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "./generated/prisma/client.js";
import jwt from "jsonwebtoken";
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
const PORT = 3000;
type HealthResponse ={status:"ok" ;time: string};

interface AuthRequest extends Request{
    userId?: string;
}
function requireAuth(req: AuthRequest, res:Response,next:NextFunction){
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({error:"No token is provided"});
    }
    const  token =authHeader.split(" ")[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {userId:string};
        req.userId =decoded.userId;
        next();
    }catch (error){
        return res.status(401).json({error:"Invalid or expired token"});
    }
}
app.get("/users/me", requireAuth, async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, name: true, email: true },
    });
    res.json(user);
});

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
app.post("/groups", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { name } = req.body;

        const group = await prisma.studyGroup.create({
            data: {
                name,
                members: {
                    create: { userId: req.userId as string },
                },
            },
        });

        res.json(group);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Could not create group" });
    }
});
app.get("/groups", async (req: Request, res: Response) => {
    const groups = await prisma.studyGroup.findMany({
        include: {
            _count: { select: { members: true } },
        },
    });
    res.json(groups);
});
app.post("/groups/:id/join", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const membership = await prisma.groupMembership.create({
            data: {
                userId: req.userId as string,
                groupId: req.params.id,
            },
        });
        res.json(membership);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Could not join group (maybe already a member?)" });
    }
});

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});