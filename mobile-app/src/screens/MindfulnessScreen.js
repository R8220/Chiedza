import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {Screen,Subtitle,SectionHeader,Meta,Notice} from '../components/UI';
import {PRACTICES,GROUPS} from '../content/practices';
import {useCareMode} from '../hooks/useCareMode';
import {colors,spacing,radius,type,fonts,shadow} from '../theme';

// Spec 8. Sleep first when Low Battery Mode or a low-stimulation therapeutic mode is
// on, since 8.2's Rest Mode is the fallback for exactly those states.
export default function MindfulnessScreen({navigation}){
  const {quiet}=useCareMode();
  const groups=quiet?GROUPS:[GROUPS[1],GROUPS[0],GROUPS[2]];

  return (
    <Screen>
      <Subtitle style={{fontSize:16}}>Everything here answers one question: does this help your nervous system move safely from one state to another?</Subtitle>

      {groups.map(([key,title,blurb])=>{
        const items=Object.entries(PRACTICES).filter(([,p])=>p.group===key);
        return (
          <View key={key} style={{gap:spacing.md}}>
            <SectionHeader>{title}</SectionHeader>
            <Meta>{blurb}</Meta>
            {items.map(([id,p])=>(
              <Pressable key={id} onPress={()=>navigation.navigate('Practice',{id})} accessibilityRole="button"
                accessibilityLabel={`${p.name}. ${p.blurb}`}
                style={({pressed})=>[s.item,pressed&&{opacity:.75}]}>
                <View style={{flex:1,gap:3}}>
                  <Text style={s.name}>{p.name}</Text>
                  <Text style={type.meta}>{p.blurb}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.sepiaSoft}/>
              </Pressable>
            ))}
          </View>
        );
      })}

      {/* 8.2 Sleep Failure Support: switching from "sleep" to "rest" is the point. */}
      <Notice>If sleep does not come, that is not a failure of the night. Let Me Rest in the Quiet Arcade is a room for exactly that — rest instead of sleep, with nothing to achieve.</Notice>
    </Screen>
  );
}

const s=StyleSheet.create({
  item:{flexDirection:'row',alignItems:'center',gap:spacing.md,backgroundColor:colors.white,borderRadius:radius.md,
    borderWidth:1,borderColor:colors.line,paddingVertical:15,paddingHorizontal:16,...shadow.card},
  name:{fontFamily:fonts.serif,fontSize:17,color:colors.ink},
});
