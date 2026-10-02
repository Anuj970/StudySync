import express,{Request,Response} from "express";
const app = express();
const PORT = 3000;

type HealthResponse ={status:"ok" ;time: string};

app.get("/health",(req: Request, res: Response<HealthResponse>) =>{
    res.json({status:"ok",time:new Date().toISOString()});
});
app.post("/auth/signup", (req: Request, res: Response) => {
  res.json({ message: "signup endpoint hit" });
});

app.post("/auth/login", (req: Request, res: Response) => {
  res.json({ message: "login endpoint hit" });
});
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});