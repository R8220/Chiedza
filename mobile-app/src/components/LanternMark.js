import React from 'react';
import {View} from 'react-native';
import {colors} from '../theme';

// Chiedza means light. The mark is a lantern reduced to its glow: a hairline halo,
// a soft ring of light, and the flame at the centre. Drawn with Views so it costs
// no SVG dependency and no native rebuild.
export default function LanternMark({size=26,tint=colors.gold,halo=true}){
  const ring=size, glow=size*0.66, flame=size*0.3;
  return (
    <View style={{width:ring,height:ring,alignItems:'center',justifyContent:'center'}}>
      {halo?<View style={{position:'absolute',width:ring,height:ring,borderRadius:ring/2,borderWidth:1,borderColor:tint,opacity:.35}}/>:null}
      <View style={{position:'absolute',width:glow,height:glow,borderRadius:glow/2,backgroundColor:tint,opacity:.16}}/>
      <View style={{width:flame,height:flame,borderRadius:flame/2,backgroundColor:tint}}/>
    </View>
  );
}
