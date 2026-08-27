import React,{useCallback,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Feather} from '@expo/vector-icons';
import {api} from '../api/client';
import {Screen,Subtitle,SectionHeader,Meta,Loading} from '../components/UI';
import {useCareMode} from '../hooks/useCareMode';
import {useAuth} from '../context/AuthContext';
import {ROOMS} from './RoomScreen';
import {colors,spacing,radius,type,fonts,shadow} from '../theme';

// Spec 3, Stage 2: doors appear in the order best suited to the user's capacity.
const ORDER={little:['rest','ground','calm','carry','return'],not_much:['rest','ground','calm','carry','return'],
  some:['calm','ground','rest','return','carry'],unknown:['ground','rest','calm','carry','return']};

export default function RoomsScreen({navigation}){
  const {quiet}=useCareMode();
  const {user}=useAuth();
  const [data,setData]=useState(null);

  useFocusEffect(useCallback(()=>{
    let alive=true;
    api('/rooms').then(d=>alive&&setData(d)).catch(()=>alive&&setData({rooms:[],sessions:[]}));
    return()=>{alive=false};
  },[]));

  if(!data)return <Screen><Loading message="Opening the arcade…"/></Screen>;

  const capacity=user?.capacity||'unknown';
  const doors=ORDER[capacity]||ORDER.unknown;
  const visited=new Set((data.sessions||[]).map(s=>s.room));

  return (
    <Screen>
      <Subtitle style={{fontSize:16}}>Not games to win. Rooms to enter and softly return from — and every one of them closes gently.</Subtitle>

      <View style={{gap:spacing.md}}>
        <SectionHeader>Five doors</SectionHeader>
        {doors.map(id=>{
          const r=ROOMS[id];
          return (
            <Pressable key={id} onPress={()=>navigation.navigate('Room',{id})} accessibilityRole="button"
              accessibilityLabel={`${r.name}. ${r.feature}. ${r.state}`}
              style={({pressed})=>[s.door,pressed&&{opacity:.75}]}>
              <View style={{flex:1,gap:3}}>
                <Text style={s.name}>{r.name}</Text>
                <Text style={s.feature}>{r.feature}</Text>
                <Text style={type.meta}>{r.state}</Text>
              </View>
              {visited.has(id)&&!quiet?<View style={s.visited}/>:null}
              <Feather name="chevron-right" size={18} color={colors.sepiaSoft}/>
            </Pressable>
          );
        })}
      </View>

      <Meta>The Long Afternoon has no aftercare — that room is the aftercare. The others end with a closing you cannot skip past.</Meta>
    </Screen>
  );
}

const s=StyleSheet.create({
  door:{flexDirection:'row',alignItems:'center',gap:spacing.md,backgroundColor:colors.white,borderRadius:radius.md,
    borderWidth:1,borderColor:colors.line,paddingVertical:16,paddingHorizontal:16,...shadow.card},
  name:{fontFamily:fonts.serif,fontSize:18,color:colors.ink},
  feature:{fontFamily:fonts.bodyItalic,fontSize:13.5,color:colors.sepiaText},
  // A quiet mark that a room has been entered before. Not a streak, not a count.
  visited:{width:5,height:5,borderRadius:3,backgroundColor:colors.goldSoft},
});
