import React,{useCallback,useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {api} from '../api/client';
import {Screen,Card,Label,Input,Button,Notice,Meta,SectionHeader,Divider,Subtitle} from '../components/UI';
import {colors,spacing,radius,fonts} from '../theme';

// Spec 8.3, the journaling system. Three types, each with its own purpose and prompt.
const TYPES={
  night:['Night','What is your mind holding onto tonight?','Insomnia support — for the thoughts that arrive when the lights go off.'],
  release:['Release','What would you like to set down here?','Structured offloading. Nobody reads this but you.'],
  reflection:['Reflection','What has been circling lately?','Insight and pattern, at whatever depth you have.'],
};

export default function JournalScreen(){
  const [type,setType]=useState('reflection');
  const [content,setContent]=useState('');
  const [entries,setEntries]=useState([]);
  const [mirror,setMirror]=useState(null);
  const [err,setErr]=useState(''),[busy,setBusy]=useState(false);

  useFocusEffect(useCallback(()=>{
    let a=true;
    api('/journals').then(d=>a&&setEntries(d.entries||[])).catch(()=>{});
    return()=>{a=false};
  },[]));

  async function save(){
    if(!content.trim()||busy)return;
    setBusy(true); setErr(''); setMirror(null);
    try{
      const d=await api('/journals',{method:'POST',body:{type,content,mood:3}});
      setEntries(v=>[d.entry,...v]);
      setContent('');
      // 8.3: the AI Reflective Mirror, shown back gently rather than filed away.
      setMirror(d.entry?.aiReflection||null);
    }catch(e){setErr(e.message);}
    finally{setBusy(false);}
  }

  const [name,prompt,blurb]=TYPES[type];

  return (
    <Screen avoidKeyboard>
      <Subtitle style={{fontSize:16}}>Write without needing to turn your feelings into a performance.</Subtitle>

      <Card>
        <Label>Choose a journal</Label>
        <View style={s.tabs}>
          {Object.entries(TYPES).map(([k,[label]])=>(
            <Pressable key={k} onPress={()=>{setType(k);setMirror(null)}} accessibilityRole="radio"
              accessibilityState={{selected:type===k}} style={[s.tab,type===k&&s.tabOn]}>
              <Text style={[s.tabText,type===k&&{color:colors.ink}]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Meta>{blurb}</Meta>
        <Divider/>
        <Text style={s.prompt}>{prompt}</Text>
        <Input multiline placeholder="Whatever is here." value={content} onChangeText={setContent}/>
        <Button title={busy?'Saving…':'Keep this'} onPress={save} disabled={busy||!content.trim()}/>
        {err?<Notice danger>{err}</Notice>:null}
      </Card>

      {mirror?(
        <Card tone={colors.goldSoft}>
          <Label>Reflective mirror</Label>
          <Text style={s.mirror}>{mirror}</Text>
          <Meta>A reflection of what was noticed in your own words — not an interpretation, and not a diagnosis.</Meta>
        </Card>
      ):null}

      {entries.length?(
        <View style={{gap:spacing.md}}>
          <SectionHeader>Kept so far</SectionHeader>
          {entries.slice(0,8).map(e=>(
            <Card key={e.id}>
              <Label>{TYPES[e.type]?.[0]||e.type}</Label>
              <Text style={s.body} numberOfLines={5}>{e.content}</Text>
              {e.aiReflection?<Meta>{e.aiReflection}</Meta>:null}
            </Card>
          ))}
        </View>
      ):null}
    </Screen>
  );
}

const s=StyleSheet.create({
  tabs:{flexDirection:'row',gap:spacing.sm,paddingTop:2},
  tab:{paddingVertical:10,paddingHorizontal:16,borderRadius:radius.sm,borderWidth:1,borderColor:colors.line,backgroundColor:colors.white},
  tabOn:{borderColor:colors.gold,backgroundColor:colors.creamLift},
  tabText:{fontFamily:fonts.body,fontSize:13.5,color:colors.mutedText},
  prompt:{fontFamily:fonts.display,fontSize:24,lineHeight:31,color:colors.ink},
  mirror:{fontFamily:fonts.body,fontSize:15,lineHeight:26,color:colors.inkSoft},
  body:{fontFamily:fonts.body,fontSize:14.5,lineHeight:24,color:colors.inkSoft},
});
