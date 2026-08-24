export function determineCareState({riskLevel='low',emotion='calm',capacity='some'}){
  if(riskLevel==='crisis')return {state:'Crisis',action:'Emergency protocol',mode:'crisis',room:'ground',humanRequired:true};
  if(riskLevel==='high')return {state:'High Risk',action:'Urgent therapist alert',mode:'stabilisation',room:'ground',humanRequired:true};
  if(emotion==='overwhelmed'||capacity==='not_much')return {state:'Overwhelmed',action:'Reduce stimulation + grounding',mode:'stabilisation',room:'rest',humanRequired:false};
  if(['anxious','grieving','drained','lonely','numb'].includes(emotion))return {state:'Struggling',action:'Therapist suggestion',mode:'active',room:emotion==='grieving'?'return':emotion==='lonely'?'carry':'calm',humanRequired:false};
  return {state:'Stable',action:'AI support only',mode:'recovery',room:'calm',humanRequired:false};
}
