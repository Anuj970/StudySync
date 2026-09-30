import express,{Request,Response} from "express";
const app = express();
const PORT = 3000;

type HealthResponse ={status:"ok" ;time: string};

app.get("/health",(req: Request, res: Response<HealthResponse>) =>{
    res.json({status:"ok",time:new Date().toISOString()});
});

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});