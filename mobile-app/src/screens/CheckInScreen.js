import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {api} from '../api/client';
import {useAuth} from '../context/AuthContext';
import {Screen,Card,Label,Button,Notice,Meta,SectionHeader,Pill,Divider} from '../components/UI';
import {ROOMS} from './RoomScreen';
import {colors,spacing,radius,type,fonts,toneFor,titleCase} from '../theme';

// Spec 3, SAFER Stage 1: brief check-ins entered through state-based prompts, plus the
// capacity question that feeds the Capacity Engine. The user builds a vocabulary for
// their state without being labelled — so these are openings, not a diagnostic scale.
const PROMPTS=["I can't sleep","I feel overwhelmed","I feel numb","I'm anxious","I just want silence"];
const MOODS=[[1,'Very low'],[2,'Low'],[3,'Steady'],[4,'Lighter'],[5,'Bright']];
const CAPACITIES=[['little','A little'],['some','Some'],['not_much','Not much'],['unknown',"I don't know"]];

export default function CheckInScreen({navigation}){
  const auth=useAuth();
  const [note,setNote]=useState('');
  const [mood,setMood]=useState(3);
  const [capacity,setCapacity]=useState(auth.user?.capacity||'some');
  const [result,setResult]=useState(null);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);

  async function submit(){
    if(busy)return;
    setBusy(true); setError('');
    try{
      const d=await api('/check-ins',{method:'POST',body:{note,mood,capacity}});
      setResult(d);
      await auth.refresh();          // capacity and therapeutic mode change server-side
    }catch(e){setError(e.message);}
    finally{setBusy(false);}
  }

  if(result){
    const tone=toneFor(result.state?.state);
    const room=ROOMS[result.state?.room];
    return (
      <Screen>
        <View style={s.hero}>
          <Text style={type.label}>Noted</Text>
          <Text style={s.display}>Thank you for telling me.</Text>
          <Text style={s.lead}>Nothing here is a score, and nothing is counted against you.</Text>
        </View>

        <Card>
          <View style={s.row}>
            <Label>Where this puts you</Label>
            <Pill tint={tone.tint} wash={tone.wash}>{titleCase(result.state?.state)}</Pill>
          </View>
          <Divider/>
          <Meta>{result.state?.action}</Meta>
        </Card>

        {result.needsHumanReview?(
          <Notice>What you wrote has been passed to a trained reviewer. A person will look at it — no algorithm decides this alone. You are not blocked from carrying on.</Notice>
        ):null}

        {room?(
          <Card>
            <Label>A room that may suit</Label>
            <Text style={s.roomName}>{room.name}</Text>
            <Meta>{room.feature} — {room.state}</Meta>
            <Button title={`Enter ${room.name}`} onPress={()=>navigation.replace('Room',{id:result.state.room})}/>
          </Card>
        ):null}

        <Button secondary title="Not right now" onPress={()=>navigation.goBack()}/>
      </Screen>
    );
  }

  return (
    <Screen avoidKeyboard>
      <View style={s.hero}>
        <Text style={s.display}>How are you arriving?</Text>
        <Text style={s.lead}>Pick whatever is closest. You do not have to explain it.</Text>
      </View>

      <View style={{gap:spacing.md}}>
        <SectionHeader>Where you are</SectionHeader>
        <View style={s.chips}>
          {PROMPTS.map(p=>(
            <Pressable key={p} onPress={()=>setNote(note===p?'':p)} accessibilityRole="button"
              style={[s.chip,note===p&&s.chipOn]}>
              <Text style={[s.chipText,note===p&&{color:colors.ink}]}>{p}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Card>
        <Label>How much do you have today?</Label>
        <View style={s.optionsRow}>
          {CAPACITIES.map(([v,l])=>(
            <Pressable key={v} onPress={()=>setCapacity(v)} accessibilityRole="radio" accessibilityState={{selected:capacity===v}}
              style={[s.pillOpt,capacity===v&&s.pillOptOn]}>
              <Text style={[s.pillOptText,capacity===v&&{color:colors.ink}]}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Label>And underneath that</Label>
        <View style={s.optionsRow}>
          {MOODS.map(([v,l])=>(
            <Pressable key={v} onPress={()=>setMood(v)} accessibilityRole="radio" accessibilityState={{selected:mood===v}}
              style={[s.pillOpt,mood===v&&s.pillOptOn]}>
              <Text style={[s.pillOptText,mood===v&&{color:colors.ink}]}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <Meta>You can change your mind tomorrow, or not answer at all.</Meta>
      </Card>

      {error?<Notice danger>{error}</Notice>:null}
      <Button title={busy?'One moment…':'Leave this here'} onPress={submit} disabled={busy}/>
      <Meta>Anything that reads as risk goes to a trained human, never to an algorithm alone.</Meta>
    </Screen>
  );
}

const s=StyleSheet.create({
  hero:{gap:spacing.xs,paddingTop:spacing.sm},
  display:{fontFamily:fonts.display,fontSize:38,lineHeight:44,color:colors.ink},
  lead:{fontFamily:fonts.body,fontSize:15,lineHeight:25,color:colors.inkSoft},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.sm},

  chips:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm},
  chip:{paddingVertical:12,paddingHorizontal:15,borderRadius:radius.md,borderWidth:1,borderColor:colors.line,backgroundColor:colors.white},
  chipOn:{borderColor:colors.gold,backgroundColor:colors.creamLift},
  chipText:{fontFamily:fonts.serif,fontSize:16,color:colors.inkSoft},

  optionsRow:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,paddingTop:2},
  pillOpt:{paddingVertical:10,paddingHorizontal:14,borderRadius:radius.sm,borderWidth:1,borderColor:colors.line,backgroundColor:colors.white},
  pillOptOn:{borderColor:colors.gold,backgroundColor:colors.creamLift},
  pillOptText:{fontFamily:fonts.body,fontSize:13.5,color:colors.mutedText},

  roomName:{fontFamily:fonts.serif,fontSize:19,color:colors.ink},
});
