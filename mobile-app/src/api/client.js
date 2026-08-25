import AsyncStorage from '@react-native-async-storage/async-storage';
const API_URL=process.env.EXPO_PUBLIC_API_URL||'http://10.0.2.2:3000/api/mobile';
export async function api(path,{method='GET',body,auth=true}={}){
  const headers={'Content-Type':'application/json'};
  if(auth){const token=await AsyncStorage.getItem('chiedza_token');if(token)headers.Authorization=`Bearer ${token}`;}
  const res=await fetch(`${API_URL}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  if(res.status===204)return null;
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||'Something went quiet. Please try again.');
  return data;
}
