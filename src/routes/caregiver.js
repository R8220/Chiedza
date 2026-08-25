import express from 'express';
import {requireAuth,requireRole} from '../middleware/auth.js';
import {CaregiverLink,User,CareSummary,Milestone,CarePlan} from '../models/index.js';
const router=express.Router();router.use(requireAuth,requireRole('caregiver'));
router.get('/caregiver',async(req,res)=>{const links=await CaregiverLink.findAll({where:{caregiverId:req.user.id,status:'active'},include:[{model:User,as:'client',attributes:['id','name','therapeuticMode','capacity']}]});const cards=[];for(const link of links){const scopes=link.scopes||[];const item={link,client:link.client,summary:null,milestones:[],plan:null};if(scopes.includes('summary'))item.summary=await CareSummary.findOne({where:{userId:link.userId},order:[['createdAt','DESC']]});if(scopes.includes('milestones'))item.milestones=await Milestone.findAll({where:{userId:link.userId},order:[['happenedAt','DESC']],limit:5});if(scopes.includes('care_plan'))item.plan=await CarePlan.findOne({where:{userId:link.userId,status:'active'},order:[['updatedAt','DESC']]});cards.push(item);}res.render('caregiver/dashboard',{title:'Companion Mode',cards});});
export default router;
