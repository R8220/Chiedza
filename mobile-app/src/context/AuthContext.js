import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api,clearApiCache} from '../api/client';
const AuthContext=createContext(null);
export function AuthProvider({children}){const[user,setUser]=useState(null),[loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{try{const t=await AsyncStorage.getItem('chiedza_token');if(t){const d=await api('/me');setUser(d.user);}}catch{}finally{setLoading(false);}})();},[]);
  const value=useMemo(()=>({user,loading,async login(email,password){const d=await api('/auth/login',{method:'POST',body:{email,password},auth:false});await AsyncStorage.setItem('chiedza_token',d.token);setUser(d.user);},async register(name,email,password){const d=await api('/auth/register',{method:'POST',body:{name,email,password},auth:false});await AsyncStorage.setItem('chiedza_token',d.token);setUser(d.user);},async refresh(){const d=await api('/me');setUser(d.user);},async logout(){await AsyncStorage.removeItem('chiedza_token');await clearApiCache();setUser(null);},setUser}),[user,loading]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
