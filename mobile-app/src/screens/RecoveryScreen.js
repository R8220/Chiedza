import React,{useCallback,useState} from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {api} from '../api/client';
import {Screen,Card,Label,Input,Button,Loading,Meta,SectionHeader,Notice,Divider,Pill} from '../components/UI';
import SunMark from '../components/SunMark';
import {colors,spacing,radius,fonts,toneFor,titleCase} from '../theme';

// Spec 1.2, The Hearthstone: the emotional landscape as a hearth with flames, embers
// and stones, each stone a milestone the user defined. 1.2 asks the colour to shift
// with emotional state; the brand palette carries that rather than the literal
// gold/blue/green of the description, so nothing off-palette is introduced.
function Hearth({state,stones,embers}){
  const tone=toneFor(state||'stable');
  return (
    <View style={[s.hearth,{backgroundColor:tone.wash}]}>
      <View style={s.fire}>
        <SunMark size={54} tint={tone.tint}/>
        {/* Embers are ongoing healing work still being processed — not achievements. */}
        <View style={s.embers}>
          {Array.from({length:Math.min(6,embers)}).map((_,i)=>(
            <View key={i} style={[s.ember,{backgroundColor:tone.tint,opacity:.25+(i%3)*0.2}]}/>
          ))}
        </View>
      </View>
      {stones.length?(
        <View style={s.stones}>
          {stones.slice(0,8).map(m=>(
            <View key={m.id} style={s.stone}><Text style={s.stoneText} numberOfLines={2}>{m.title}</Text></View>
          ))}
        </View>
      ):<Meta style={{textAlign:'center'}}>No stones placed yet. You decide what counts as one.</Meta>}
    </View>
  );
}

export default function RecoveryScreen(){
  const [data,setData]=useState(null);
  const [title,setTitle]=useState('');
  const [busy,setBusy]=useState(false),[err,setErr]=useState('');

  const load=useCallback(()=>api('/recovery').then(setData),[]);
  useFocusEffect(useCallback(()=>{let a=true;api('/recovery').then(d=>a&&setData(d)).catch(()=>{});return()=>{a=false}},[]));

  async function place(){
    if(!title.trim()||busy)return;
    setBusy(true); setErr('');
    try{await api('/milestones',{method:'POST',body:{title:title.trim()}}); setTitle(''); await load();}
    catch(e){setErr(e.message);} finally{setBusy(false);}
  }

  if(!data)return <Screen><Loading message="Gathering your hearth…"/></Screen>;

  const latest=data.checkIns?.[0];
  const tone=toneFor(latest?.state||'stable');

  return (
    <Screen avoidKeyboard>
      <View style={s.head}>
        <Text style={s.display}>Return to Self</Text>
        <Text style={s.lead}>Your recovery can be non-linear. You define what “better” means.</Text>
      </View>

      <Hearth state={latest?.state} stones={data.milestones||[]} embers={(data.journals||[]).length}/>

      {latest?(
        <View style={s.stateRow}>
          <Pill tint={tone.tint} wash={tone.wash}>{titleCase(latest.state)}</Pill>
          <Meta>The hearth takes its colour from where you are now.</Meta>
        </View>
      ):null}

      <Card>
        <Label>Place a Hearthstone</Label>
        <Meta>A milestone that matters to you. Nobody else decides what qualifies.</Meta>
        <Input placeholder="What has shifted?" value={title} onChangeText={setTitle}/>
        <Button title={busy?'Placing…':'Place stone'} onPress={place} disabled={busy||!title.trim()}/>
        {err?<Notice danger>{err}</Notice>:null}
      </Card>

      <Card>
        <View style={s.row}>
          <Label>Aftercare</Label>
          {data.aftercareRate!=null?<Text style={s.rate}>{data.aftercareRate}%</Text>:null}
        </View>
        <Divider/>
        <Meta>{data.aftercareRate==null
          ?'No room exits yet. This fills in once you have been through a room.'
          :`${data.aftercareRate}% of recent room exits completed their full closing. It measures how well the app landed you, not how well you performed.`}</Meta>
      </Card>

      {/* Layer 2 produces these; the app requested them and displayed nothing. */}
      {data.summaries?.length?(
        <View style={{gap:spacing.md}}>
          <SectionHeader>Care summaries</SectionHeader>
          <Meta>Written so a therapist reads structure instead of raw conversation. Each one still requires a clinician's review before it is treated as accurate.</Meta>
          {data.summaries.map(sm=>(
            <Card key={sm.id}>
              <View style={s.row}>
                <Label>{sm.period||'Summary'}</Label>
                <Meta>{sm.reviewedAt?'Reviewed':'Awaiting review'}</Meta>
              </View>
              <Divider/>
              <Text style={s.body}>{sm.summary||sm.content||'—'}</Text>
            </Card>
          ))}
        </View>
      ):null}

      {data.journals?.length?(
        <View style={{gap:spacing.md}}>
          <SectionHeader>Recent reflections</SectionHeader>
          {data.journals.slice(0,4).map(j=>(
            <Card key={j.id}>
              <Label>{j.type}</Label>
              <Text style={s.body} numberOfLines={4}>{j.content}</Text>
              {j.aiReflection?<Meta>{j.aiReflection}</Meta>:null}
            </Card>
          ))}
        </View>
      ):null}
    </Screen>
  );
}

const s=StyleSheet.create({
  head:{gap:spacing.xs,paddingTop:spacing.sm},
  display:{fontFamily:fonts.display,fontSize:38,lineHeight:44,color:colors.ink},
  lead:{fontFamily:fonts.body,fontSize:15,lineHeight:25,color:colors.inkSoft},

  hearth:{borderRadius:radius.lg,paddingVertical:spacing.xl,paddingHorizontal:spacing.lg,gap:spacing.lg,alignItems:'center'},
  fire:{alignItems:'center',gap:spacing.sm},
  embers:{flexDirection:'row',gap:6},
  ember:{width:5,height:5,borderRadius:3},
  stones:{flexDirection:'row',flexWrap:'wrap',gap:spacing.sm,justifyContent:'center'},
  // Pebbles: wide, low and rounded, like stones cradling a fire.
  stone:{backgroundColor:colors.white,borderRadius:radius.pill,paddingVertical:10,paddingHorizontal:16,
    borderWidth:1,borderColor:colors.line,maxWidth:190},
  stoneText:{fontFamily:fonts.serif,fontSize:14,color:colors.ink,textAlign:'center'},

  stateRow:{flexDirection:'row',alignItems:'center',gap:spacing.md,flexWrap:'wrap'},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.sm},
  rate:{fontFamily:fonts.display,fontSize:26,color:colors.ink},
  body:{fontFamily:fonts.body,fontSize:14.5,lineHeight:24,color:colors.inkSoft},
});
