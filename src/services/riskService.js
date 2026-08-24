const crisisPatterns=[/\bkill myself\b/i,/\bend my life\b/i,/\bsuicid(?:e|al)\b/i,/\bi want to die\b/i,/\bi(?:'| a)?m going to hurt myself\b/i,/\bself[- ]?harm\b/i,/\bno reason to live\b/i];
const highPatterns=[/\bcan't go on\b/i,/\bcannot go on\b/i,/\bhopeless\b/i,/\bnothing matters\b/i,/\bwant to disappear\b/i,/\bnot worth living\b/i,/\bpanic attack\b/i];
const themePatterns={grief:/\b(grief|grieving|bereave|loss|lost someone|funeral|miss them)\b/i,burnout:/\b(burnout|burned out|exhausted|overworked|drained)\b/i,trauma:/\b(trauma|flashback|triggered|nightmare)\b/i,anxiety:/\b(anxious|anxiety|panic|racing thoughts|worried)\b/i,sleep:/\b(insomnia|can't sleep|cannot sleep|awake all night|sleep)\b/i,loneliness:/\b(lonely|alone|isolated|unseen|unwitnessed)\b/i,overwhelm:/\b(overwhelmed|too much|can't cope|cannot cope)\b/i,numbness:/\b(numb|empty|dissociated|far away)\b/i};
export function analyseText(text=''){
  const value=String(text);
  const themes=Object.entries(themePatterns).filter(([,r])=>r.test(value)).map(([n])=>n);
  let riskLevel='low';
  if(crisisPatterns.some(p=>p.test(value)))riskLevel='crisis'; else if(highPatterns.some(p=>p.test(value)))riskLevel='high'; else if(themes.includes('overwhelm')||themes.includes('anxiety')||themes.includes('trauma'))riskLevel='moderate';
  let emotion='calm';
  if(themes.includes('overwhelm'))emotion='overwhelmed'; else if(themes.includes('anxiety'))emotion='anxious'; else if(themes.includes('numbness'))emotion='numb'; else if(themes.includes('grief'))emotion='grieving'; else if(themes.includes('burnout'))emotion='drained'; else if(themes.includes('loneliness'))emotion='lonely';
  return {riskLevel,themes,emotion};
}
export function safeFirstResponse(riskLevel){
  if(riskLevel==='crisis')return 'Something in what you wrote tells me you may need more support than I can give. I am staying with you while the care team and your local support options are brought forward.';
  if(riskLevel==='high')return 'Something in what you wrote tells me you might need more support than I can give on my own. I have marked this for human review and made your support options easier to reach.';
  return null;
}
