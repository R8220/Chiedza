(() => {
  const steps=[...document.querySelectorAll('.onboarding-step')];let step=0;
  document.querySelectorAll('[data-next]').forEach(btn=>btn.addEventListener('click',()=>{if(!steps.length)return;steps[step]?.classList.remove('active');step=Math.min(step+1,steps.length-1);steps[step]?.classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}));
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  document.querySelectorAll('.mini-practice').forEach(btn=>btn.addEventListener('click',()=>{const overlay=document.getElementById('practice-overlay');const copy=document.getElementById('practice-copy');if(!overlay)return;copy.textContent=btn.dataset.practice==='rest'?'Nothing has to happen. Let the exhale take a little longer than the inhale.':'You don\'t have to do anything.';overlay.hidden=false;}));
  document.getElementById('close-practice')?.addEventListener('click',()=>document.getElementById('practice-overlay').hidden=true);
})();
