import express from 'express';
const router=express.Router();
router.get('/',(req,res)=>res.render('home',{title:'A recovery layer for the after'}));
router.get('/about',(req,res)=>res.render('about',{title:'What Chiedza is'}));
router.get('/pricing',(req,res)=>res.render('pricing',{title:'Access & licensing'}));
router.get('/sanctuary',(req,res)=>res.render('sanctuary',{title:'Digital Healing Sanctuary'}));
export default router;
