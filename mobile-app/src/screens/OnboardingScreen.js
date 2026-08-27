import React,{useMemo,useState} from 'react';
import {View,Text,Pressable,StyleSheet,ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Feather} from '@expo/vector-icons';
import {api} from '../api/client';
import {useAuth} from '../context/AuthContext';
import {Button,Notice,Meta} from '../components/UI';
import SunMark from '../components/SunMark';
import {colors,spacing,radius,type,fonts} from '../theme';

// Spec 5.1, the first 90 seconds. One task per screen (9.2: single-task screens,
// no competing stimuli). No timers and no progress pressure — the timings in the
// spec describe pace, not a countdown the user has to keep up with.
const capacities=[['little','A little'],['some','Some'],['not_much','Not much'],['unknown',"I don't know"]];

const rooms={
  calm:['Calm Me','Lantern Breathing','Panic, overwhelm, racing thoughts'],
  ground:['Ground Me','The Quiet Room','Dissociation, anxiety, feeling far away'],
  rest:['Let Me Rest','The Long Afternoon','Chronic fatigue, flare, sensory overload'],
  return:['Help Me Return','The Memory House','Grief, identity transition, post-crisis'],
  carry:['Carry With Me','Lanterns Left Behind','Loneliness, feeling unwitnessed'],
};

// Spec 3, Stage 2: "Five doors appear in the order best suited to the user's capacity."
// Heuristics only at this phase — the least demanding rooms lead when capacity is low.
const doorOrder={
  little:['rest','ground','calm','carry','return'],
  not_much:['rest','ground','calm','carry','return'],
  some:['calm','ground','rest','return','carry'],
  unknown:['ground','rest','calm','carry','return'],
};

export default function OnboardingScreen(){
  const auth=useAuth();
  const insets=useSafeAreaInsets();
  const [step,setStep]=useState(0);
  const [capacity,setCapacity]=useState(null);
  const [room,setRoom]=useState(null);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);

  const doors=useMemo(()=>doorOrder[capacity]||doorOrder.unknown,[capacity]);

  async function enter(){
    if(busy)return;
    setBusy(true); setError('');
    try{
      const d=await api('/me/onboarding',{method:'PUT',body:{
        capacity:capacity||'unknown',
        communicationPreference:'chat',
        needs:room?[room]:[],
      }});
      auth.setUser(d.user);
    }catch(e){setError(e.message); setBusy(false);}
  }

  const steps=[
    // 00:00 — sets nervous-system tone before any data is collected
    {key:'arrival',render:()=>(
      <View style={s.centre}>
        <SunMark size={64}/>
        <Text style={s.display}>Take a breath.</Text>
        <Text style={s.lead}>There is no rush. This app does not need you to perform.</Text>
      </View>
    ),action:'Continue',onNext:()=>setStep(1)},

    // 00:15 — plain language, no legal walls
    {key:'consent',render:()=>(
      <View style={s.block}>
        <Text style={type.label}>Before anything else</Text>
        <Text style={s.display}>We will not sell your data.</Text>
        <Text style={s.lead}>We will not message you with guilt.</Text>
        <View style={s.list}>
          {['You choose what is shared, and with whom.','Sensitive writing is encrypted before it is stored.','You can change any of this later in Settings.'].map(t=>(
            <View key={t} style={s.listRow}>
              <View style={s.bullet}/>
              <Text style={s.listText}>{t}</Text>
            </View>
          ))}
        </View>
        {/* Spec 3, Stage 2: users are told when they are speaking with AI and what it cannot do. */}
        <Notice>The listener is an AI. It listens and reflects — it is not a therapist, and it does not diagnose. A trained human reviews anything that looks like risk, and crisis options are always one tap away.</Notice>
      </View>
    ),action:'I understand',onNext:()=>setStep(2)},

    // 00:30 — first input to the Capacity Engine
    {key:'capacity',render:()=>(
      <View style={s.block}>
        <Text style={type.label}>Capacity</Text>
        <Text style={s.display}>How much do you have today?</Text>
        <Text style={s.lead}>There is no wrong answer, and it can change tomorrow.</Text>
        <View style={s.options}>
          {capacities.map(([v,label])=>(
            <Pressable key={v} onPress={()=>setCapacity(v)} accessibilityRole="radio" accessibilityState={{selected:capacity===v}}
              style={[s.option,capacity===v&&s.optionOn]}>
              <Text style={[s.optionText,capacity===v&&{color:colors.ink}]}>{label}</Text>
              {capacity===v?<Feather name="check" size={16} color={colors.sepiaText}/>:null}
            </Pressable>
          ))}
        </View>
      </View>
    ),action:'Continue',disabled:()=>!capacity,onNext:()=>setStep(3)},

    // 00:45 — the routing question
    {key:'routing',render:()=>(
      <View style={s.block}>
        <Text style={type.label}>The Quiet Arcade</Text>
        <Text style={s.display}>What kind of care do you need right now?</Text>
        <Text style={s.lead}>Rooms to enter and softly return from. You can leave any of them at any time.</Text>
        <View style={s.options}>
          {doors.map(id=>{
            const [name,feature,state]=rooms[id];
            return (
              <Pressable key={id} onPress={()=>setRoom(id)} accessibilityRole="radio" accessibilityState={{selected:room===id}}
                style={[s.door,room===id&&s.optionOn]}>
                <View style={{flex:1,gap:3}}>
                  <Text style={s.doorName}>{name}</Text>
                  <Text style={s.doorFeature}>{feature}</Text>
                  <Text style={type.meta}>{state}</Text>
                </View>
                {room===id?<Feather name="check" size={16} color={colors.sepiaText}/>:null}
              </Pressable>
            );
          })}
        </View>
      </View>
    ),action:'Continue',disabled:()=>!room,onNext:()=>setStep(4)},

    // 01:00 — trust is built by showing the safety architecture first
    {key:'aftercare',render:()=>(
      <View style={s.centre}>
        <SunMark size={52}/>
        <Text style={type.label}>A taste of aftercare</Text>
        <Text style={s.display}>Whatever happens in this room, this is how it ends.</Text>
        <Text style={s.lead}>You will not be left alone. Every room closes gently, and you can always come back to it.</Text>
      </View>
    ),action:'Enter',onNext:enter},
  ];

  const current=steps[step];
  const blocked=current.disabled?.()||busy;

  return (
    <View style={[s.screen,{paddingTop:insets.top+spacing.lg,paddingBottom:insets.bottom+spacing.lg}]}>
      <View style={s.head}>
        {step>0?(
          <Pressable onPress={()=>{setError('');setStep(step-1)}} hitSlop={12} accessibilityLabel="Go back">
            <Feather name="chevron-left" size={22} color={colors.sepiaText}/>
          </Pressable>
        ):<View style={{width:22}}/>}
        <View style={s.dots}>
          {steps.map((st,i)=><View key={st.key} style={[s.dot,i===step&&s.dotOn]}/>)}
        </View>
        <View style={{width:22}}/>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {current.render()}
        {error?<Notice danger>{error}</Notice>:null}
      </ScrollView>

      <View style={s.foot}>
        <Button title={busy?'One moment…':current.action} onPress={current.onNext} disabled={blocked}/>
        {step===0?<Meta style={{textAlign:'center'}}>Nothing is saved until you choose to continue.</Meta>:null}
      </View>
    </View>
  );
}

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.cream,paddingHorizontal:spacing.lg},
  head:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingBottom:spacing.lg},
  dots:{flexDirection:'row',gap:6},
  dot:{width:5,height:5,borderRadius:3,backgroundColor:colors.line},
  dotOn:{backgroundColor:colors.gold,width:16},

  body:{flexGrow:1,justifyContent:'center',gap:spacing.lg,paddingVertical:spacing.md},
  centre:{alignItems:'center',gap:spacing.md},
  block:{gap:spacing.sm},

  display:{fontFamily:fonts.display,fontSize:38,lineHeight:44,color:colors.ink,marginTop:spacing.xs},
  lead:{fontFamily:fonts.body,fontSize:15.5,lineHeight:26,color:colors.inkSoft},

  list:{gap:spacing.sm,paddingTop:spacing.sm},
  listRow:{flexDirection:'row',gap:spacing.sm,alignItems:'flex-start'},
  bullet:{width:4,height:4,borderRadius:2,backgroundColor:colors.gold,marginTop:10},
  listText:{flex:1,fontFamily:fonts.body,fontSize:14.5,lineHeight:24,color:colors.inkSoft},

  options:{gap:spacing.sm,paddingTop:spacing.sm},
  option:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:16,paddingHorizontal:16,
    borderRadius:radius.md,borderWidth:1,borderColor:colors.line,backgroundColor:colors.white},
  optionOn:{borderColor:colors.gold,backgroundColor:colors.creamLift},
  optionText:{fontFamily:fonts.serif,fontSize:18,color:colors.inkSoft},

  door:{flexDirection:'row',alignItems:'center',gap:spacing.md,paddingVertical:15,paddingHorizontal:16,
    borderRadius:radius.md,borderWidth:1,borderColor:colors.line,backgroundColor:colors.white},
  doorName:{fontFamily:fonts.serif,fontSize:18,color:colors.ink},
  doorFeature:{fontFamily:fonts.bodyItalic,fontSize:13.5,color:colors.sepiaText},

  foot:{gap:spacing.sm,paddingTop:spacing.md},
});
