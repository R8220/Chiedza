import React,{useCallback,useState} from 'react';
import {Text,View,StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Feather} from '@expo/vector-icons';
import {api} from '../api/client';
import {Screen,Subtitle,Card,Label,Body,Meta,SectionHeader,ChoiceCard,Pill,Divider,Loading,Notice} from '../components/UI';
import {useAuth} from '../context/AuthContext';
import {colors,spacing,type,fonts,toneFor,titleCase} from '../theme';

const capacityCopy={little:'Little','not_much':'Not much',some:'Some',unknown:'Not set'};
const modeCopy={stabilisation:'Stabilisation',active:'Active care',recovery:'Recovery',crisis:'Crisis'};
const moodCopy={1:'Very low',2:'Low',3:'Steady',4:'Lighter',5:'Bright'};

function partOfDay(d){const h=d.getHours();return h<12?'morning':h<17?'afternoon':'evening';}

function whenLabel(value){
  if(!value)return null;
  const then=new Date(value); if(Number.isNaN(then.getTime()))return null;
  const days=Math.floor((Date.now()-then.getTime())/86400000);
  if(days<=0)return 'Today';
  if(days===1)return 'Yesterday';
  if(days<7)return `${days} days ago`;
  return then.toLocaleDateString(undefined,{day:'numeric',month:'long'});
}

export default function HomeScreen({navigation}){
  const {user}=useAuth();
  const [data,setData]=useState(null);

  useFocusEffect(useCallback(()=>{
    let alive=true;
    api('/home').then(d=>alive&&setData(d)).catch(()=>{});
    return()=>{alive=false};
  },[]));

  if(!data)return <Screen><Loading message="Gathering your place…"/></Screen>;

  const now=new Date();
  const person=data.user||user||{};
  const firstName=String(person.name||'').trim().split(/\s+/)[0];
  const check=data.latestCheckIn;
  const tone=toneFor(check?.state||'stable');

  return (
    <Screen>
      {/* Gentle Return Layer: arrival without any missed-day guilt. */}
      <View style={s.hero}>
        <Text style={type.label}>{now.toLocaleDateString(undefined,{weekday:'long'})} {partOfDay(now)}</Text>
        <Text style={s.heroTitle}>Welcome back{firstName?',':''}</Text>
        {firstName?<Text style={s.heroName}>{firstName}.</Text>:null}
        <View style={s.heroRule}/>
        <Subtitle style={{fontSize:16}}>We kept your place. Nothing was lost while you were away.</Subtitle>
      </View>

      <Card>
        <View style={s.cardHead}>
          <Label>Where you are today</Label>
          <Pill tint={tone.tint} wash={tone.wash}>{check?.state?titleCase(check.state):'Not set'}</Pill>
        </View>
        <Divider/>
        <View style={s.statRow}>
          <View style={s.stat}>
            <Text style={type.meta}>Capacity</Text>
            <Text style={s.statValue}>{capacityCopy[person.capacity]||titleCase(person.capacity)||'—'}</Text>
          </View>
          <View style={s.statSpacer}/>
          <View style={s.stat}>
            <Text style={type.meta}>Care mode</Text>
            <Text style={s.statValue}>{modeCopy[person.therapeuticMode]||titleCase(person.therapeuticMode)||'—'}</Text>
          </View>
        </View>
        <Meta>You set the pace. This changes with you, and never counts against you.</Meta>
      </Card>

      <View style={{gap:spacing.md}}>
        <SectionHeader>What do you need right now</SectionHeader>
        <ChoiceCard icon="message-circle" title="Someone to listen"
          description="The AI listener, at whatever length you have in you"
          tint={colors.sepia} wash={colors.creamDeep}
          onPress={()=>navigation.navigate('Listener')}/>
        <ChoiceCard icon="moon" title="A quiet room"
          description="Breathe, ground, or simply rest — there is no fail state"
          tint={colors.moss} wash={colors.mossWash}
          onPress={()=>navigation.navigate('Rooms')}/>
        <ChoiceCard icon="edit-3" title="To write it down"
          description="Night pages, release, and reflection"
          tint={colors.rose} wash={colors.roseWash}
          onPress={()=>navigation.navigate('Journal')}/>
      </View>

      {check?(
        <Card>
          <Label>Your last check-in</Label>
          <View style={s.checkRow}>
            <Text style={s.checkMood}>{moodCopy[check.mood]||'Noted'}</Text>
            <Text style={type.meta}>{whenLabel(check.createdAt)}</Text>
          </View>
          {check.emotion?<Meta>Noted as {String(check.emotion).toLowerCase()}.</Meta>:null}
          <Meta>Kept so you never have to explain yourself twice.</Meta>
        </Card>
      ):null}

      {data.therapist?(
        <Card>
          <Label>Your therapist</Label>
          <View style={s.therapistRow}>
            <View style={s.therapistAvatar}><Feather name="user" size={17} color={colors.sepia}/></View>
            <View style={{flex:1}}>
              <Text style={s.therapistName}>{data.therapist.name}</Text>
              <Meta>Sees only what you have consented to share.</Meta>
            </View>
          </View>
        </Card>
      ):(
        <Card>
          <Label>Your therapist</Label>
          <Body style={{fontSize:15}}>No primary therapist assigned yet. The AI listener is here in the meantime.</Body>
        </Card>
      )}

      {data.aftercareRate!==null&&data.aftercareRate!==undefined?(
        <Card>
          <View style={s.cardHead}>
            <Label>Recovery signal</Label>
            <Text style={s.rateValue}>{data.aftercareRate}%</Text>
          </View>
          <View style={s.meterTrack}>
            <View style={[s.meterFill,{width:`${Math.max(2,Math.min(100,data.aftercareRate))}%`}]}/>
          </View>
          <Meta>Aftercare completion — a measure of care quality, not a streak. Nothing is lost by resting.</Meta>
        </Card>
      ):null}

      {data.openSafeguardingFlags>0?(
        <Notice>A care review item is open for you. This is a human-support pathway, not a punishment or an account restriction.</Notice>
      ):null}
    </Screen>
  );
}

const s=StyleSheet.create({
  hero:{paddingTop:spacing.sm,paddingBottom:spacing.xs,gap:spacing.xs,overflow:'hidden'},
  // A single warm bloom behind the masthead, echoing the lantern.
  heroTitle:{fontFamily:fonts.display,fontSize:46,lineHeight:52,color:colors.ink,marginTop:spacing.xs},
  heroName:{fontFamily:fonts.displayItalic,fontSize:46,lineHeight:52,color:colors.sepia},
  heroRule:{width:52,height:1,backgroundColor:colors.gold,marginVertical:spacing.md,opacity:.7},

  cardHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.sm},
  statRow:{flexDirection:'row',alignItems:'stretch',paddingVertical:spacing.xs},
  stat:{flex:1,gap:3},
  statSpacer:{width:1,backgroundColor:colors.line,marginHorizontal:spacing.md},
  statValue:{fontFamily:fonts.serif,fontSize:19,color:colors.ink},

  checkRow:{flexDirection:'row',alignItems:'baseline',justifyContent:'space-between',gap:spacing.sm},
  checkMood:{fontFamily:fonts.serif,fontSize:22,color:colors.ink},

  therapistRow:{flexDirection:'row',alignItems:'center',gap:spacing.md,paddingTop:2},
  therapistAvatar:{width:40,height:40,borderRadius:20,backgroundColor:colors.creamDeep,alignItems:'center',justifyContent:'center'},
  therapistName:{fontFamily:fonts.serif,fontSize:17,color:colors.ink},

  rateValue:{fontFamily:fonts.display,fontSize:26,color:colors.ink},
  meterTrack:{height:5,borderRadius:3,backgroundColor:colors.creamDeep,overflow:'hidden',marginTop:2},
  meterFill:{height:5,borderRadius:3,backgroundColor:colors.gold},
});
