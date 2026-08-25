import {TherapistProfile,Assignment,User} from '../models/index.js';
function overlap(a=[],b=[]){const set=new Set((a||[]).map(x=>String(x).toLowerCase()));return (b||[]).filter(x=>set.has(String(x).toLowerCase())).length;}
export async function findBestTherapist(client){
  const profiles=await TherapistProfile.findAll({include:[{model:User,as:'user',where:{isActive:true}}]}); const scored=[];
  for(const profile of profiles){const activeCount=await Assignment.count({where:{therapistId:profile.userId,active:true}});if(activeCount>=profile.workloadLimit)continue;let score=0;score+=Math.min(overlap(profile.specialties||[],client.needs||[])*25,50);if(client.preferredTherapistGender&&profile.gender===client.preferredTherapistGender)score+=10;if(client.faith&&profile.faithAlignment&&String(profile.faithAlignment).toLowerCase()===String(client.faith).toLowerCase())score+=10;if(profile.acceptingNewClients)score+=15;if((profile.languages||[]).map(l=>String(l).toLowerCase()).includes(String(client.language||'en').toLowerCase()))score+=7;if(profile.timezone&&client.timezone&&profile.timezone===client.timezone)score+=3;const loadRatio=activeCount/Math.max(profile.workloadLimit,1);score+=Math.round((1-loadRatio)*5);scored.push({profile,score,activeCount});}
  scored.sort((a,b)=>b.score-a.score);return scored[0]||null;
}
