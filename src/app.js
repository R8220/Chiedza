import 'dotenv/config';
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import session from 'express-session';
import SequelizeStoreFactory from 'connect-session-sequelize';
import expressLayouts from 'express-ejs-layouts';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sequelize from './config/database.js';
import {syncDatabase} from './models/index.js';
import {attachUser} from './middleware/auth.js';
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import roomRoutes from './routes/rooms.js';
import aiRoutes from './routes/ai.js';
import mindfulnessRoutes from './routes/mindfulness.js';
import communityRoutes from './routes/community.js';
import therapistRoutes from './routes/therapist.js';
import reviewerRoutes from './routes/reviewer.js';
import adminRoutes from './routes/admin.js';
import caregiverRoutes from './routes/caregiver.js';
import mobileApiRoutes from './routes/mobileApi.js';
const __filename=fileURLToPath(import.meta.url);const __dirname=path.dirname(__filename);const app=express();app.disable('x-powered-by');
// Behind a tunnel/proxy (ngrok, load balancer) this is required so req.ip is the real
// client rather than the proxy, otherwise every visitor shares one rate-limit bucket.
app.set('trust proxy',1);
app.set('view engine','ejs');app.set('views',path.join(__dirname,'..','views'));app.use(expressLayouts);app.set('layout','layout');
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));app.use(express.urlencoded({extended:true,limit:'2mb'}));app.use(express.json({limit:'2mb'}));app.use(express.static(path.join(__dirname,'..','public')));
// Placed before the session middleware so platform health checks never touch the session store.
app.get('/healthz',(req,res)=>res.status(200).json({status:'ok',uptime:process.uptime()}));
const SequelizeStore=SequelizeStoreFactory(session.Store);const sessionStore=new SequelizeStore({db:sequelize,tableName:'Sessions',checkExpirationInterval:15*60*1000,expiration:14*24*60*60*1000});
app.use(session({secret:process.env.SESSION_SECRET||'development-session-secret-change-me',resave:false,saveUninitialized:false,store:sessionStore,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:14*24*60*60*1000}}));
const authLimiter=rateLimit({windowMs:15*60*1000,limit:100,standardHeaders:'draft-8',legacyHeaders:false});
app.use(attachUser);app.use(['/login','/register','/api/ai','/api/mobile/auth'],authLimiter);app.use('/api/mobile',mobileApiRoutes);app.use(publicRoutes);app.use(authRoutes);app.use(userRoutes);app.use(roomRoutes);app.use(aiRoutes);app.use(mindfulnessRoutes);app.use(communityRoutes);app.use(therapistRoutes);app.use(reviewerRoutes);app.use(adminRoutes);app.use(caregiverRoutes);
app.use((req,res)=>res.status(404).render('error',{title:'Page not found',message:'That path is not part of this Chiedza build.'}));
app.use((error,req,res,next)=>{console.error(error);res.status(500).render('error',{title:'Something went quiet',message:process.env.NODE_ENV==='development'?error.message:'The system could not complete that request. Please try again or contact the care team.'});});
export async function startServer(){await sequelize.authenticate();if(String(process.env.AUTO_SYNC_DB||'true').toLowerCase()==='true'){await syncDatabase();await sessionStore.sync();}const port=Number(process.env.PORT||3000);return app.listen(port,()=>{console.log(`Chiedza running at http://localhost:${port}`);console.log(`Database: ${process.env.DB_DIALECT||'sqlite'}`);console.log(`AI provider: ${process.env.OPENAI_API_KEY?'OpenAI configured':'safe local fallback'}`);});}
if(process.env.NODE_ENV!=='test'){startServer().catch(error=>{console.error('Startup failed:',error);process.exit(1);});}
export default app;
