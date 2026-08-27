import React,{useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,StyleSheet,Animated,Easing} from 'react-native';
import {useCareMode} from '../hooks/useCareMode';
import {Button,Meta} from '../components/UI';
import SunMark from '../components/SunMark';
import {PRACTICES} from '../content/practices';
import {colors,spacing,radius,type,fonts} from '../theme';

const BREATH=[['Breathe in',4000,1],['Hold',2000,1],['Breathe out',6000,0]];

function Breath({animate}){
  const scale=useRef(new Animated.Value(0.72)).current;
  const [phase,setPhase]=useState(0);
  useEffect(()=>{
    let alive=true,i=0,timer;
    const run=()=>{
      if(!alive)return;
      const [,ms,to]=BREATH[i]; setPhase(i);
      const next=()=>{if(!alive)return; i=(i+1)%BREATH.length; run();};
      if(!animate){ timer=setTimeout(next,ms); return; }
      Animated.timing(scale,{toValue:0.72+to*0.5,duration:ms,easing:Easing.inOut(Easing.quad),useNativeDriver:true})
        .start(({finished})=>{if(finished)next()});
    };
    run();
    return()=>{alive=false; if(timer)clearTimeout(timer);};
  },[animate,scale]);
  return (
    <View style={s.stage}>
      <Animated.View style={[s.halo,animate&&{transform:[{scale}]}]}><SunMark size={80}/></Animated.View>
      <Text style={s.cue}>{BREATH[phase][0]}</Text>
      <Meta style={{textAlign:'center'}}>Follow it loosely, or just watch it move.</Meta>
    </View>
  );
}

export default function PracticeScreen({route,navigation}){
  const id=route?.params?.id;
  const p=PRACTICES[id];
  const {animate}=useCareMode();
  const [i,setI]=useState(0);

  if(!p)return <View style={s.screen}><Text style={s.line}>That practice is not available.</Text></View>;

  // 8.2 Silence Mode: no guidance, nothing to do, and nothing that ends it but you.
  if(p.kind==='silence'){
    return (
      <View style={[s.screen,s.centre]}>
        <SunMark size={40} tint={colors.goldSoft} halo={false}/>
        <Text style={s.silence}>You don't have to do anything.</Text>
        <View style={s.foot}><Button secondary title="Leave when ready" onPress={()=>navigation.goBack()}/></View>
      </View>
    );
  }

  if(p.kind==='breath'){
    return (
      <View style={s.screen}>
        <View style={s.body}><Breath animate={animate}/></View>
        <View style={s.foot}><Button title="Close gently" onPress={()=>navigation.goBack()}/></View>
      </View>
    );
  }

  const last=i>=p.steps.length-1;
  return (
    <View style={s.screen}>
      <View style={s.body}>
        <Text style={type.label}>{i+1} of {p.steps.length}</Text>
        <Text style={s.line}>{p.steps[i]}</Text>
      </View>
      <View style={s.foot}>
        <Button title={last?'Close gently':'When you are ready'} onPress={()=>last?navigation.goBack():setI(i+1)}/>
        {i>0?<Pressable onPress={()=>setI(i-1)} hitSlop={10}><Meta style={{textAlign:'center'}}>Back a step</Meta></Pressable>:
             <Meta style={{textAlign:'center'}}>Nothing here is timed. Take as long as you like.</Meta>}
      </View>
    </View>
  );
}

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.cream,paddingHorizontal:spacing.lg},
  centre:{alignItems:'center',justifyContent:'center',gap:spacing.lg},
  body:{flex:1,justifyContent:'center',gap:spacing.md},
  stage:{alignItems:'center',gap:spacing.md},
  halo:{alignItems:'center',justifyContent:'center',width:180,height:180,borderRadius:90,backgroundColor:colors.goldWash},
  cue:{fontFamily:fonts.display,fontSize:30,color:colors.sepiaText,letterSpacing:1},
  line:{fontFamily:fonts.display,fontSize:32,lineHeight:42,color:colors.ink},
  silence:{fontFamily:fonts.display,fontSize:30,lineHeight:40,color:colors.sepiaText,textAlign:'center'},
  foot:{gap:spacing.sm,paddingBottom:spacing.xl,paddingTop:spacing.md},
});
