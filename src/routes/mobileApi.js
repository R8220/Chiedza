import express from 'express';
import bcrypt from 'bcryptjs';
import {Op} from 'sequelize';
import {
  User,CheckIn,AIMessage,RiskFlag,CrisisContact,CareSummary,JournalEntry,RoomSession,
  Lantern,Milestone,GriefArchiveItem,Assignment,SessionBooking,DirectMessage,CaregiverLink
} from '../models/index.js';
import {signMobileToken,requireMobileAuth} from '../middleware/mobileAuth.js';
import {analyseText,safeFirstResponse} from '../services/riskService.js';
import {determineCareState} from '../services/orchestratorService.js';
import {getListenerReply,generateCareSummary,generatePoem} from '../services/aiService.js';
import {buildEmotionalForecast} from '../services/forecastService.js';
import {encryptText,decryptText} from '../utils/crypto.js';

const router=express.Router();
const pickUser=u=>({id:u.id,name:u.name,email:u.email,role:u.role,language:u.language,culture:u.culture,faith:u.faith,timezone:u.timezone,communicationPreference:u.communicationPreference,therapeuticMode:u.therapeuticMode,capacity:u.capacity,aiOnlyMode:u.aiOnlyMode,therapistVisibility:u.therapistVisibility,transcriptSharing:u.transcriptSharing,recordingConsent:u.recordingConsent,contactConsent:u.contactConsent,lowBatteryMode:u.lowBatteryMode,reducedMotion:u.reducedMotion,onboardingComplete:u.onboardingComplete});

router.post('/auth/register',async(req,res)=>{
  const name=String(req.body.name||'').trim().slice(0,120), email=String(req.body.email||'').trim().toLowerCase(), password=String(req.body.password||'');
  if(!name||!email||password.length<8)return res.status(400).json({error:'Name, valid email and a password of at least 8 characters are required.'});
  if(await User.findOne({where:{email}}))return res.status(409).json({error:'An account with that email already exists.'});
  const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12),role:'user'});
  res.status(201).json({token:signMobileToken(user),user:pickUser(user)});
});

router.post('/auth/login',async(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase(), password=String(req.body.password||'');
  const user=await User.findOne({where:{email}});
  if(!user||!(await bcrypt.compare(password,user.passwordHash)))return res.status(401).json({error:'Incorrect email or password.'});
  if(user.role!=='user')return res.status(403).json({error:'This mobile build currently supports client accounts. Therapist, reviewer and admin workflows remain on the secure web dashboard.'});
  await user.update({lastSeenAt:new Date()});
  res.json({token:signMobileToken(user),user:pickUser(user)});
});

router.use(requireMobileAuth);
router.get('/me',(req,res)=>res.json({user:pickUser(req.mobileUser)}));
router.put('/me/onboarding',async(req,res)=>{
  const u=req.mobileUser;
  await u.update({
    language:String(req.body.language||u.language||'en').slice(0,20),culture:String(req.body.culture||'').slice(0,80),faith:String(req.body.faith||'').slice(0,80),
    capacity:['little','some','not_much','unknown'].includes(req.body.capacity)?req.body.capacity:u.capacity,
    communicationPreference:String(req.body.communicationPreference||'chat').slice(0,40),needs:Array.isArray(req.body.needs)?req.body.needs.slice(0,12):u.needs,
    onboardingComplete:true
  });
  res.json({user:pickUser(u)});
});
router.put('/me/settings',async(req,res)=>{
  const u=req.mobileUser;
  const fields=['aiOnlyMode','therapistVisibility','transcriptSharing','recordingConsent','contactConsent','lowBatteryMode','reducedMotion'];
  const update={}; for(const f of fields)if(typeof req.body[f]==='boolean')update[f]=req.body[f];
  if(req.body.communicationPreference)update.communicationPreference=String(req.body.communicationPreference).slice(0,40);
  await u.update(update); res.json({user:pickUser(u)});
});

router.get('/home',async(req,res)=>{
  const u=req.mobileUser;
  const [latestCheckIn,assignment,openFlags,roomSessions]=await Promise.all([
    CheckIn.findOne({where:{userId:u.id},order:[['createdAt','DESC']]}),
    Assignment.findOne({where:{userId:u.id,active:true,isPrimary:true},include:[{model:User,as:'therapist',attributes:['id','name']}]}),
    RiskFlag.count({where:{userId:u.id,status:{[Op.ne]:'closed'}}}),
    RoomSession.findAll({where:{userId:u.id},order:[['createdAt','DESC']],limit:20})
  ]);
  const aftercareCount=roomSessions.filter(s=>s.room==='rest'||s.aftercareCompleted).length;
  res.json({user:pickUser(u),latestCheckIn,therapist:assignment?.therapist||null,openSafeguardingFlags:openFlags,aftercareRate:roomSessions.length?Math.round(aftercareCount/roomSessions.length*100):null});
});

router.post('/check-ins',async(req,res)=>{
  const note=String(req.body.note||'').trim().slice(0,3000); const analysis=analyseText(note);
  const mood=Math.max(1,Math.min(5,Number(req.body.mood||3))); const capacity=req.body.capacity||req.mobileUser.capacity;
  const care=determineCareState({riskLevel:analysis.riskLevel,emotion:analysis.emotion,capacity});
  const row=await CheckIn.create({userId:req.mobileUser.id,mood,capacity,state:care.state,note,emotion:analysis.emotion,riskLevel:analysis.riskLevel});
  await req.mobileUser.update({capacity,therapeuticMode:care.mode,lastSeenAt:new Date()});
  if(['high','crisis'].includes(analysis.riskLevel))await RiskFlag.create({userId:req.mobileUser.id,source:'check_in',excerpt:note.slice(0,500),riskLevel:analysis.riskLevel,status:'open'});
  res.status(201).json({checkIn:row,state:care,needsHumanReview:['high','crisis'].includes(analysis.riskLevel)});
});

router.get('/listener',async(req,res)=>{
  const rows=await AIMessage.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','ASC']],limit:80});
  res.json({messages:rows.map(m=>({...m.toJSON(),content:decryptText(m.encryptedContent)}))});
});
router.post('/listener',async(req,res)=>{
  const u=req.mobileUser, message=String(req.body.message||'').trim().slice(0,5000); if(!message)return res.status(400).json({error:'Please write something first.'});
  const analysis=analyseText(message), orchestrated=determineCareState({riskLevel:analysis.riskLevel,emotion:analysis.emotion,capacity:u.capacity});
  await AIMessage.create({userId:u.id,sender:'user',encryptedContent:encryptText(message),emotion:analysis.emotion,riskLevel:analysis.riskLevel,themes:analysis.themes});
  if(['high','crisis'].includes(analysis.riskLevel)){
    const assignment=await Assignment.findOne({where:{userId:u.id,active:true,isPrimary:true}});
    await RiskFlag.create({userId:u.id,source:'ai_listener',excerpt:message.slice(0,500),riskLevel:analysis.riskLevel,status:'open',therapistNotifiedAt:assignment?new Date():null});
    await u.update({therapeuticMode:orchestrated.mode}); const reply=safeFirstResponse(analysis.riskLevel);
    await AIMessage.create({userId:u.id,sender:'ai',encryptedContent:encryptText(reply),emotion:analysis.emotion,riskLevel:analysis.riskLevel,themes:analysis.themes});
    const contacts=await CrisisContact.findAll({where:{active:true},order:[['priority','ASC']],limit:6});
    return res.json({reply,state:orchestrated,crisisBridge:true,contacts:contacts.map(c=>({name:c.name,phone:c.phone,website:c.website,region:c.region}))});
  }
  const recentRows=await AIMessage.findAll({where:{userId:u.id},order:[['createdAt','DESC']],limit:10}); const recentMessages=recentRows.reverse().map(m=>({...m.toJSON(),content:decryptText(m.encryptedContent)}));
  const reply=await getListenerReply({message,user:u,analysis,recentMessages});
  await AIMessage.create({userId:u.id,sender:'ai',encryptedContent:encryptText(reply),emotion:analysis.emotion,riskLevel:analysis.riskLevel,themes:analysis.themes});
  const messageCount=await AIMessage.count({where:{userId:u.id}}); if(messageCount>0&&messageCount%10===0){const messages=(await AIMessage.findAll({where:{userId:u.id},order:[['createdAt','ASC']],limit:20})).map(m=>({...m.toJSON(),content:decryptText(m.encryptedContent)})); const checkIns=await CheckIn.findAll({where:{userId:u.id},order:[['createdAt','DESC']],limit:10}); const summary=await generateCareSummary({messages,checkIns,user:u}); await CareSummary.create({userId:u.id,summary,periodStart:messages[0]?.createdAt||new Date(),periodEnd:new Date()});}
  res.json({reply,state:orchestrated,crisisBridge:false});
});
router.post('/poetry',async(req,res)=>{const prompt=String(req.body.prompt||'').trim().slice(0,3000); if(!prompt)return res.status(400).json({error:'Add a feeling or memory first.'}); res.json({poem:await generatePoem({prompt,user:req.mobileUser,format:req.body.format||'free verse'})});});

router.get('/rooms',async(req,res)=>{const sessions=await RoomSession.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','DESC']],limit:30});res.json({rooms:[{id:'calm',name:'Calm Me',subtitle:'Lantern Breathing'},{id:'ground',name:'Ground Me',subtitle:'The Quiet Room'},{id:'rest',name:'Let Me Rest',subtitle:'The Long Afternoon'},{id:'return',name:'Help Me Return',subtitle:'The Memory House'},{id:'carry',name:'Carry With Me',subtitle:'Lanterns Left Behind'}],sessions});});
router.post('/rooms/:room/complete',async(req,res)=>{const room=req.params.room;if(!['calm','ground','rest','return','carry'].includes(room))return res.status(404).json({error:'Unknown room.'});const row=await RoomSession.create({userId:req.mobileUser.id,room,stateBefore:String(req.body.stateBefore||''),stateAfter:String(req.body.stateAfter||''),aftercareCompleted:room==='rest'?true:Boolean(req.body.aftercareCompleted),details:req.body.details||{}});res.status(201).json({session:row});});

router.get('/journals',async(req,res)=>{const rows=await JournalEntry.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','DESC']],limit:50});res.json({entries:rows.map(j=>({...j.toJSON(),content:decryptText(j.encryptedContent)}))});});
router.post('/journals',async(req,res)=>{const content=String(req.body.content||'').trim().slice(0,8000);if(!content)return res.status(400).json({error:'Journal entry cannot be empty.'});const analysis=analyseText(content);const row=await JournalEntry.create({userId:req.mobileUser.id,type:['night','release','reflection'].includes(req.body.type)?req.body.type:'reflection',encryptedContent:encryptText(content),mood:Math.max(1,Math.min(5,Number(req.body.mood||3))),themes:analysis.themes,aiReflection:'A gentle reflection will become richer as your longitudinal care memory grows.'});if(['high','crisis'].includes(analysis.riskLevel))await RiskFlag.create({userId:req.mobileUser.id,source:'journal',excerpt:content.slice(0,500),riskLevel:analysis.riskLevel,status:'open'});res.status(201).json({entry:{...row.toJSON(),content}});});

router.get('/community',async(req,res)=>{const rows=await Lantern.findAll({where:{moderationStatus:'approved'},order:[['publishedAt','DESC']],limit:50});res.json({lanterns:rows.map(l=>({id:l.id,theme:l.theme,pod:l.pod,content:decryptText(l.encryptedContent),publishedAt:l.publishedAt}))});});
router.post('/community',async(req,res)=>{const content=String(req.body.content||'').trim().slice(0,1200);if(!content)return res.status(400).json({error:'Write something before leaving a lantern.'});const analysis=analyseText(content);const row=await Lantern.create({userId:req.mobileUser.id,encryptedContent:encryptText(content),theme:String(req.body.theme||'general').slice(0,80),pod:String(req.body.pod||'global').slice(0,80),moderationStatus:'pending',safetyFlag:['high','crisis'].includes(analysis.riskLevel)});if(row.safetyFlag)await RiskFlag.create({userId:req.mobileUser.id,source:'community',excerpt:content.slice(0,500),riskLevel:analysis.riskLevel,status:'open'});res.status(201).json({message:'Your lantern is waiting for human review before it becomes visible.',lanternId:row.id});});

router.get('/recovery',async(req,res)=>{const [milestones,checkIns,summaries,roomSessions,journals]=await Promise.all([Milestone.findAll({where:{userId:req.mobileUser.id},order:[['happenedAt','DESC']]}),CheckIn.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','DESC']],limit:30}),CareSummary.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','DESC']],limit:5}),RoomSession.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','DESC']],limit:20}),JournalEntry.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','DESC']],limit:10})]);const aftercareCount=roomSessions.filter(s=>s.room==='rest'||s.aftercareCompleted).length;res.json({milestones,checkIns,summaries,forecast:buildEmotionalForecast(checkIns),aftercareRate:roomSessions.length?Math.round(aftercareCount/roomSessions.length*100):null,journals:journals.map(j=>({...j.toJSON(),content:decryptText(j.encryptedContent)}))});});
router.post('/milestones',async(req,res)=>{const row=await Milestone.create({userId:req.mobileUser.id,title:String(req.body.title||'').trim().slice(0,120),note:String(req.body.note||'').slice(0,1200),stoneType:String(req.body.stoneType||'healing').slice(0,40)});res.status(201).json({milestone:row});});

router.get('/grief',async(req,res)=>{const rows=await GriefArchiveItem.findAll({where:{userId:req.mobileUser.id},order:[['createdAt','DESC']]});res.json({items:rows.map(i=>({...i.toJSON(),content:decryptText(i.encryptedContent)}))});});
router.post('/grief',async(req,res)=>{const content=String(req.body.content||'').slice(0,8000),analysis=analyseText(content);const row=await GriefArchiveItem.create({userId:req.mobileUser.id,title:String(req.body.title||'Untitled memory').slice(0,180),type:['story','letter','photo','audio','memory'].includes(req.body.type)?req.body.type:'memory',encryptedContent:encryptText(content),sharedWithTherapist:Boolean(req.body.sharedWithTherapist)});if(['high','crisis'].includes(analysis.riskLevel))await RiskFlag.create({userId:req.mobileUser.id,source:'grief_archive',excerpt:content.slice(0,500),riskLevel:analysis.riskLevel,status:'open'});res.status(201).json({item:{...row.toJSON(),content}});});

router.get('/sessions',async(req,res)=>{const assignment=await Assignment.findOne({where:{userId:req.mobileUser.id,active:true,isPrimary:true},include:[{model:User,as:'therapist',attributes:['id','name']} ]});const bookings=await SessionBooking.findAll({where:{userId:req.mobileUser.id},include:[{model:User,as:'therapist',attributes:['id','name']}],order:[['scheduledAt','ASC']]});res.json({therapist:assignment?.therapist||null,bookings});});
router.post('/sessions',async(req,res)=>{const assignment=await Assignment.findOne({where:{userId:req.mobileUser.id,active:true,isPrimary:true}});if(!assignment)return res.status(409).json({error:'A therapist needs to be assigned before a session can be requested.'});const dt=new Date(req.body.scheduledAt);if(Number.isNaN(dt.getTime()))return res.status(400).json({error:'A valid session date and time is required.'});const row=await SessionBooking.create({userId:req.mobileUser.id,therapistId:assignment.therapistId,type:['video','audio','chat'].includes(req.body.type)?req.body.type:'chat',scheduledAt:dt,status:'requested',notes:String(req.body.notes||'').slice(0,1000)});res.status(201).json({booking:row});});

router.get('/messages',async(req,res)=>{const assignment=await Assignment.findOne({where:{userId:req.mobileUser.id,active:true,isPrimary:true},include:[{model:User,as:'therapist',attributes:['id','name']}]});if(!assignment)return res.json({therapist:null,messages:[]});const rows=await DirectMessage.findAll({where:{[Op.or]:[{senderId:req.mobileUser.id,recipientId:assignment.therapistId},{senderId:assignment.therapistId,recipientId:req.mobileUser.id}]},order:[['createdAt','ASC']],limit:200});res.json({therapist:assignment.therapist,messages:rows.map(m=>({...m.toJSON(),content:decryptText(m.encryptedContent)}))});});
router.post('/messages',async(req,res)=>{const assignment=await Assignment.findOne({where:{userId:req.mobileUser.id,active:true,isPrimary:true}});if(!assignment)return res.status(409).json({error:'A therapist needs to be assigned before secure messaging is available.'});const message=String(req.body.message||'').trim().slice(0,5000);if(!message)return res.status(400).json({error:'Message cannot be empty.'});const row=await DirectMessage.create({senderId:req.mobileUser.id,recipientId:assignment.therapistId,encryptedContent:encryptText(message),messageType:'text'});res.status(201).json({message:{...row.toJSON(),content:message}});});

router.get('/companion',async(req,res)=>{const links=await CaregiverLink.findAll({where:{userId:req.mobileUser.id},include:[{model:User,as:'caregiver',attributes:['id','name','email']}]});res.json({links});});
router.post('/companion',async(req,res)=>{const caregiver=await User.findOne({where:{email:String(req.body.email||'').toLowerCase(),role:'caregiver'}});if(!caregiver)return res.status(404).json({error:'No caregiver account with that email exists yet.'});const scopes=Array.isArray(req.body.scopes)?req.body.scopes:['summary'];const[link]=await CaregiverLink.findOrCreate({where:{userId:req.mobileUser.id,caregiverId:caregiver.id},defaults:{scopes,status:'active'}});await link.update({scopes,status:'active'});res.json({link});});
router.delete('/companion/:id',async(req,res)=>{const link=await CaregiverLink.findOne({where:{id:req.params.id,userId:req.mobileUser.id}});if(!link)return res.status(404).json({error:'Companion link not found.'});await link.update({status:'revoked'});res.status(204).end();});

export default router;
