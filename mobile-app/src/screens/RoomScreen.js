import React,{useCallback,useEffect,useRef,useState} from 'react';
import {View,Text,Pressable,StyleSheet,Animated,Easing,ScrollView} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {api} from '../api/client';
import {useCareMode} from '../hooks/useCareMode';
import {Button,Input,Meta,Notice} from '../components/UI';
import SunMark from '../components/SunMark';
import {colors,spacing,radius,type,fonts} from '../theme';

// Spec 4.1/4.2. Each room's mechanic, and its closing line, are taken from the
// specification rather than invented. Aftercare is a stage the user passes through,
// not a button that asserts it happened — 4.3 says the Containment Pipeline "cannot
// be bypassed on good days", so leaving early records aftercareCompleted:false.
export const ROOMS={
  calm:{name:'Calm Me',feature:'Lantern Breathing',state:'Panic, overwhelm, racing thoughts',
    closing:'What did you notice in your body?',downshift:true},
  ground:{name:'Ground Me',feature:'The Quiet Room',state:'Dissociation, anxiety, feeling far away',
    closing:'You arrived. That counts.'},
  rest:{name:'Let Me Rest',feature:'The Long Afternoon',state:'Chronic fatigue, flare, sensory overload',
    closing:null},   // 4.2: there is no aftercare — this room IS the aftercare
  return:{name:'Help Me Return',feature:'The Memory House',state:'Grief, identity transition, post-crisis',
    closing:'You can come back to this room whenever you need to.'},
  carry:{name:'Carry With Me',feature:'Lanterns Left Behind',state:'Loneliness, feeling unwitnessed',
    closing:'Someone, somewhere, has read what you left. You will never know who, but they know you existed.'},
};

// 8.2: breath pacing on a 4-2-6 rhythm. A held flame that steadies as the breath steadies.
const BREATH=[['Breathe in',4000,1],['Hold',2000,1],['Breathe out',6000,0]];

function LanternBreathing({animate}){
  const scale=useRef(new Animated.Value(0.72)).current;
  const [phase,setPhase]=useState(0);
  useEffect(()=>{
    let alive=true,i=0;
    const run=()=>{
      if(!alive)return;
      const [,ms,to]=BREATH[i];
      setPhase(i);
      const next=()=>{ if(!alive)return; i=(i+1)%BREATH.length; run(); };
      if(!animate){ const t=setTimeout(next,ms); return ()=>clearTimeout(t); }
      Animated.timing(scale,{toValue:0.72+to*0.5,duration:ms,easing:Easing.inOut(Easing.quad),useNativeDriver:true}).start(({finished})=>{if(finished)next()});
    };
    run();
    return()=>{alive=false};
  },[animate,scale]);
  return (
    <View style={s.stage}>
      <Animated.View style={[s.halo,animate&&{transform:[{scale}]}]}>
        <SunMark size={86}/>
      </Animated.View>
      <Text style={s.cue}>{BREATH[phase][0]}</Text>
      <Meta style={{textAlign:'center'}}>There is no fail state here. Follow it loosely, or just watch.</Meta>
    </View>
  );
}

// 4.2: slow tap-to-discover sensory grounding, the 5-4-3-2-1 variant named in 8.2.
const SENSES=[
  ['five things you can see','Let your eyes rest on each one before moving on.'],
  ['four things you can touch','The floor counts. So does your own hand.'],
  ['three things you can hear','Including the sounds underneath the obvious ones.'],
  ['two things you can smell','Or two you remember clearly.'],
  ['one thing you can taste','Or one you would like to.'],
];

function QuietRoom({onDone}){
  const [i,setI]=useState(0);
  const [n,d]=SENSES[i];
  return (
    <View style={s.stage}>
      <Text style={type.label}>{i+1} of {SENSES.length}</Text>
      <Text style={s.prompt}>Notice {n}.</Text>
      <Text style={s.lead}>{d}</Text>
      <Pressable onPress={()=>i<SENSES.length-1?setI(i+1):onDone()} style={s.tap} accessibilityRole="button">
        <Text style={s.tapText}>{i<SENSES.length-1?'When you have':'I have arrived'}</Text>
      </Pressable>
    </View>
  );
}

// 4.2: a held space. No content, no achievement, and no aftercare afterwards.
function LongAfternoon(){
  return (
    <View style={s.stage}>
      <SunMark size={54} tint={colors.goldSoft}/>
      <Text style={s.prompt}>Stay as long as you need.</Text>
      <Text style={s.lead}>Nothing here is waiting for you. There is no exercise, no progress, and nothing to finish.{'\n\n'}This room is the aftercare.</Text>
    </View>
  );
}

// 4.2: a long-arc room where each visit asks one quiet question.
const HOUSE_QUESTIONS=['Did you tell the truth today?','What did you leave behind?','What are you carrying that was never yours?','Who would you like to forgive, including yourself?'];

function MemoryHouse({note,setNote,seed}){
  const q=HOUSE_QUESTIONS[seed%HOUSE_QUESTIONS.length];
  return (
    <View style={s.stage}>
      <Text style={type.label}>One quiet question</Text>
      <Text style={s.prompt}>{q}</Text>
      <Text style={s.lead}>Answer it, or sit with it. Nothing is sent anywhere.</Text>
      <Input multiline placeholder="If you would like to write something." value={note} onChangeText={setNote} style={{marginTop:spacing.sm}}/>
    </View>
  );
}

export default function RoomScreen({route,navigation}){
  const id=route?.params?.id||'calm';
  const room=ROOMS[id]||ROOMS.calm;
  const {animate,quiet}=useCareMode();
  const [phase,setPhase]=useState('experience');   // experience | closing | reflect | downshift
  const [note,setNote]=useState('');
  const [reflection,setReflection]=useState('');
  const [error,setError]=useState('');
  const posted=useRef(false);
  const seed=useRef(Math.floor(Date.now()/86400000)).current;

  // Records the session honestly: aftercare is only claimed when it was actually passed through.
  const finish=useCallback(async(aftercareCompleted,stateAfter)=>{
    if(posted.current)return; posted.current=true;
    try{
      await api(`/rooms/${id}/complete`,{method:'POST',body:{
        aftercareCompleted,stateAfter:stateAfter||'',
        details:{source:'mobile',reflection:reflection?reflection.slice(0,500):undefined},
      }});
    }catch(e){setError(e.message); posted.current=false; return false;}
    return true;
  },[id,reflection]);

  // Leaving mid-experience is allowed, and is recorded as aftercare not completed.
  useEffect(()=>navigation.addListener('beforeRemove',()=>{
    if(!posted.current&&phase==='experience'&&id!=='rest')finish(false,'left_early');
  }),[navigation,phase,finish,id]);

  async function leaveExperience(){
    // 4.2: The Long Afternoon has no aftercare stage; the room itself is the landing.
    if(id==='rest'){ if(await finish(true,'rested'))navigation.goBack(); return; }
    setPhase('closing');
  }

  async function done(){
    if(await finish(true,'settled'))navigation.goBack();
  }

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {phase==='experience'?(
          <>
            <View style={s.head}>
              <Text style={type.label}>{room.name}</Text>
              <Text style={s.title}>{room.feature}</Text>
            </View>
            {id==='calm'?<LanternBreathing animate={animate}/>:null}
            {id==='ground'?<QuietRoom onDone={()=>setPhase('closing')}/>:null}
            {id==='rest'?<LongAfternoon/>:null}
            {id==='return'?<MemoryHouse note={note} setNote={setNote} seed={seed}/>:null}
            {id==='carry'?(
              <View style={s.stage}>
                <Text style={s.prompt}>Leave a lantern.</Text>
                <Text style={s.lead}>Anonymous and slow. No likes, no replies, no followers — and you will never know who reads it.</Text>
                <Button title="Open Carry With Me" onPress={()=>navigation.navigate('Community')}/>
              </View>
            ):null}
          </>
        ):null}

        {phase==='closing'?(
          <View style={s.stage}>
            <SunMark size={46}/>
            <Text style={s.closing}>{room.closing}</Text>
            {room.downshift?<Text style={s.lead}>Take one slower breath before you go.</Text>:null}
          </View>
        ):null}

        {phase==='reflect'?(
          <View style={s.stage}>
            <Text style={type.label}>If you would like to</Text>
            <Text style={s.prompt}>{room.closing}</Text>
            <Input multiline placeholder="Anything you noticed. This is optional." value={reflection} onChangeText={setReflection}/>
            <Meta>You can leave this empty. Nothing is measured by it.</Meta>
          </View>
        ):null}

        {error?<Notice danger>{error}</Notice>:null}
      </ScrollView>

      <View style={s.foot}>
        {phase==='experience'?(
          <>
            <Button title={id==='rest'?'I am ready to leave':id==='ground'?'Leave the room':'Close the room'} onPress={leaveExperience}/>
            {!quiet&&id==='calm'?<Meta style={{textAlign:'center'}}>Stay as long as it is useful.</Meta>:null}
          </>
        ):null}
        {phase==='closing'?(
          <Button title="Continue" onPress={()=>setPhase(room.downshift?'reflect':'reflect')}/>
        ):null}
        {phase==='reflect'?(
          <Button title="Close gently" onPress={done}/>
        ):null}
      </View>
    </View>
  );
}

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.cream,paddingHorizontal:spacing.lg},
  body:{flexGrow:1,justifyContent:'center',paddingVertical:spacing.xl,gap:spacing.lg},
  head:{gap:spacing.xs,alignItems:'center'},
  title:{fontFamily:fonts.display,fontSize:34,lineHeight:40,color:colors.ink,textAlign:'center'},
  stage:{alignItems:'center',gap:spacing.md,paddingVertical:spacing.md},
  halo:{alignItems:'center',justifyContent:'center',width:190,height:190,borderRadius:95,backgroundColor:colors.goldWash},
  cue:{fontFamily:fonts.display,fontSize:30,color:colors.sepiaText,letterSpacing:1},
  prompt:{fontFamily:fonts.display,fontSize:32,lineHeight:39,color:colors.ink,textAlign:'center'},
  closing:{fontFamily:fonts.display,fontSize:30,lineHeight:38,color:colors.ink,textAlign:'center'},
  lead:{fontFamily:fonts.body,fontSize:15,lineHeight:26,color:colors.inkSoft,textAlign:'center'},
  tap:{marginTop:spacing.sm,paddingVertical:14,paddingHorizontal:26,borderRadius:radius.md,borderWidth:1,borderColor:colors.goldSoft,backgroundColor:colors.creamLift},
  tapText:{fontFamily:fonts.serif,fontSize:17,color:colors.sepiaText},
  foot:{gap:spacing.sm,paddingBottom:spacing.xl,paddingTop:spacing.md},
});
