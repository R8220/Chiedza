import express from 'express';
import {requireAuth,requireRole} from '../middleware/auth.js';
import {Lantern,RiskFlag} from '../models/index.js';
import {analyseText} from '../services/riskService.js';
import {encryptText,decryptText} from '../utils/crypto.js';
const router=express.Router();router.use('/community',requireAuth,requireRole('user'));
router.get('/community',async(req,res)=>{const where={moderationStatus:'approved'};if(req.query.theme)where.theme=req.query.theme;if(req.query.pod)where.pod=req.query.pod;const lanterns=await Lantern.findAll({where,order:[['publishedAt','DESC']],limit:40});res.render('community/index',{title:'Carry With Me',lanterns:lanterns.map(l=>({...l.toJSON(),content:decryptText(l.encryptedContent)})),filters:{theme:req.query.theme||'',pod:req.query.pod||''}});});
router.post('/community',async(req,res)=>{const content=String(req.body.content||'').trim().slice(0,1200);if(!content){req.session.notice={type:'warning',text:'A lantern can be short, but it needs a few words before it can be left behind.'};return res.redirect('/community');}const analysis=analyseText(content);const safetyFlag=['high','crisis'].includes(analysis.riskLevel);await Lantern.create({userId:req.user.id,encryptedContent:encryptText(content),theme:req.body.theme||analysis.themes[0]||'general',pod:req.body.pod||'global',moderationStatus:'pending',safetyFlag});if(safetyFlag)await RiskFlag.create({userId:req.user.id,source:'community_lantern',excerpt:content.slice(0,500),riskLevel:analysis.riskLevel,status:'open'});req.session.notice={type:'success',text:'Your lantern entered the care-review queue. There are no likes, replies, followers, or public profiles here.'};res.redirect('/community');});
export default router;
