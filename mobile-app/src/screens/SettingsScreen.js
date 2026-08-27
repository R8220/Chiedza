import React,{useState} from 'react';
import {View,Text,Switch,StyleSheet} from 'react-native';
import {Screen,Card,Label,Field,Input,Button,Notice,Meta,SectionHeader,Divider} from '../components/UI';
import {useAuth} from '../context/AuthContext';
import {api} from '../api/client';
import {colors,spacing,type,fonts} from '../theme';

// Layer 8, the consent and control layer. Each switch maps to a stated control.
const consent=[
  ['aiOnlyMode','AI-only mode','No therapist is involved unless you ask for one.'],
  ['therapistVisibility','Therapist visibility','Your assigned therapist can see your summaries.'],
  ['transcriptSharing','Transcript sharing','Beyond summaries, they may read the full conversation.'],
  ['recordingConsent','Session recording','Sessions may be recorded.'],
  ['contactConsent','Care contact','We may reach out about your care.'],
];
// Spec 9.2 accessibility commitments. These now change how the app behaves.
const experience=[
  ['lowBatteryMode','Low Battery Mode','Less on screen, no ambient motion, fewer doors.'],
  ['reducedMotion','Reduced motion','Nothing animates, including the breathing room.'],
];

export default function SettingsScreen(){
  const auth=useAuth();
  const u=auth.user||{};
  const [state,setState]=useState(Object.fromEntries([...consent,...experience].map(([k])=>[k,Boolean(u[k])])));
  const [language,setLanguage]=useState(u.language||'en');
  const [culture,setCulture]=useState(u.culture||'');
  const [faith,setFaith]=useState(u.faith||'');
  const [msg,setMsg]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);

  async function save(){
    if(busy)return;
    setBusy(true); setMsg(''); setErr('');
    try{
      const d=await api('/me/settings',{method:'PUT',body:{...state,language:language.trim()||'en',culture:culture.trim(),faith:faith.trim()}});
      auth.setUser(d.user);
      setMsg('Saved. You can change any of this again whenever you like.');
    }catch(e){setErr(e.message);}
    finally{setBusy(false);}
  }

  const row=([k,label,detail])=>(
    <View key={k}>
      <View style={s.row}>
        <View style={{flex:1,gap:2,paddingRight:spacing.md}}>
          <Text style={s.rowLabel}>{label}</Text>
          <Text style={type.meta}>{detail}</Text>
        </View>
        <Switch value={state[k]} onValueChange={v=>setState(x=>({...x,[k]:v}))}
          trackColor={{true:colors.goldSoft,false:colors.line}} thumbColor={colors.white}
          accessibilityLabel={label}/>
      </View>
      <Divider/>
    </View>
  );

  return (
    <Screen avoidKeyboard>
      <Text style={s.lead}>You choose what is visible, shared and active. Nothing here is permanent.</Text>

      <View style={{gap:spacing.md}}>
        <SectionHeader>Consent</SectionHeader>
        <Card>{consent.map(row)}<Meta>Sensitive writing is encrypted before it is stored, whatever these are set to.</Meta></Card>
      </View>

      <View style={{gap:spacing.md}}>
        <SectionHeader>How the app behaves</SectionHeader>
        <Card>{experience.map(row)}<Meta>Low Battery Mode also turns off motion, so you only need one of these.</Meta></Card>
      </View>

      {/* Cultural Relevance Engine inputs — deliberately here rather than in the
          first 90 seconds, which spec 5.1 keeps short. */}
      <View style={{gap:spacing.md}}>
        <SectionHeader>Language and context</SectionHeader>
        <Card>
          <Field label="Language" hint="A code such as en, sn, xh, zu, af, yo.">
            <Input value={language} onChangeText={setLanguage} autoCapitalize="none" autoCorrect={false} placeholder="en"/>
          </Field>
          <Field label="Culture or community" hint="Optional. It shapes the examples and metaphors you are offered.">
            <Input value={culture} onChangeText={setCulture} placeholder="Optional"/>
          </Field>
          <Field label="Faith" hint="Optional. Leave empty and nothing faith-based will appear.">
            <Input value={faith} onChangeText={setFaith} placeholder="Optional"/>
          </Field>
        </Card>
      </View>

      {msg?<Notice>{msg}</Notice>:null}
      {err?<Notice danger>{err}</Notice>:null}
      <Button title={busy?'Saving…':'Save settings'} onPress={save} disabled={busy}/>
      <Button secondary title="Sign out" onPress={auth.logout}/>
    </Screen>
  );
}

const s=StyleSheet.create({
  lead:{fontFamily:fonts.body,fontSize:15,lineHeight:25,color:colors.inkSoft},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12},
  rowLabel:{fontFamily:fonts.serif,fontSize:17,color:colors.ink},
});
