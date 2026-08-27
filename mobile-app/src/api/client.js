import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL=process.env.EXPO_PUBLIC_API_URL||'http://localhost:3000/api/mobile';
const CACHE='chiedza_cache:';

// Spec 11.1 requires Low Battery Mode and basic grounding to work offline. The
// grounding practices are bundled content and need no network at all; this adds the
// other half — successful reads are kept, so the app still opens with your last
// known state on a train or a dead signal instead of an error screen.
// Writes are not queued: nothing should silently claim to have saved.
export async function api(path,{method='GET',body,auth=true}={}){
  const headers={'Content-Type':'application/json'};
  if(auth){
    const token=await AsyncStorage.getItem('chiedza_token');
    if(token)headers.Authorization=`Bearer ${token}`;
  }

  let res;
  try{
    res=await fetch(`${API_URL}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  }catch{
    // Network unreachable, as opposed to the server answering with an error.
    if(method==='GET'){
      const cached=await AsyncStorage.getItem(CACHE+path).catch(()=>null);
      if(cached){
        try{return {...JSON.parse(cached),offline:true};}catch{}
      }
    }
    throw new Error('You appear to be offline. Grounding and rest still work without a connection.');
  }

  if(res.status===204)return null;
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||'Something went quiet. Please try again.');

  if(method==='GET'&&data&&typeof data==='object'){
    AsyncStorage.setItem(CACHE+path,JSON.stringify(data)).catch(()=>{});
  }
  return data;
}

// Cleared on sign-out so a shared device does not keep the previous person's state.
export async function clearApiCache(){
  try{
    const keys=await AsyncStorage.getAllKeys();
    const ours=keys.filter(k=>k.startsWith(CACHE));
    if(ours.length)await AsyncStorage.multiRemove(ours);
  }catch{}
}
