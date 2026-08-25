import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';

const secret=()=>process.env.JWT_SECRET||process.env.SESSION_SECRET||'development-jwt-secret-change-me';

export function signMobileToken(user){
  return jwt.sign({sub:user.id,role:user.role,email:user.email},secret(),{expiresIn:'14d'});
}

export async function requireMobileAuth(req,res,next){
  try{
    const header=String(req.headers.authorization||'');
    const token=header.startsWith('Bearer ')?header.slice(7):'';
    if(!token)return res.status(401).json({error:'Authentication required.'});
    const payload=jwt.verify(token,secret());
    const user=await User.findByPk(payload.sub);
    if(!user||!user.isActive)return res.status(401).json({error:'Account unavailable.'});
    req.mobileUser=user;
    next();
  }catch(error){
    return res.status(401).json({error:'Session expired. Please sign in again.'});
  }
}
