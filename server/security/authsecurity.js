const jwt=require('jsonwebtoken')
require("dotenv").config()

const verifytoken =(req,res,next)=>{
    const autHeader=req.headers["authorization"];
    const token= autHeader && autHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({massage:"Erişim reddedildi"})
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next()
    } catch (er) {
        res.status(401).json({massage:"Geçersiz token"})
    }
}

const verifyAdmin=(req,res,next)=>{
    if (req.user&&req.user.role==="admin") {
        next();
    }
    else{
        res.json({message:"Buişlem için yetkiniz yok."})
    }
}

module.exports=verifytoken
