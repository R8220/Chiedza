import React from 'react';
import {View} from 'react-native';
import {colors} from '../theme';

// The brand mark from the Chiedza Innovations logo: a sun, rays radiating from a
// solid core. Drawn with Views so it stays crisp at any size and costs no asset.
// Each ray is rotated then pushed outward along its own axis, so the count is free.
export default function SunMark({size=26,tint=colors.gold,rays=8}){
  const core=size*0.46;
  const rayW=Math.max(1.5,size*0.075), rayH=size*0.19, orbit=size*0.30;
  return (
    <View style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}>
      {Array.from({length:rays}).map((_,i)=>(
        <View key={i} style={{
          position:'absolute',width:rayW,height:rayH,borderRadius:rayW/2,backgroundColor:tint,
          transform:[{rotate:`${(360/rays)*i}deg`},{translateY:-(orbit+rayH/2)}],
        }}/>
      ))}
      <View style={{width:core,height:core,borderRadius:core/2,backgroundColor:tint}}/>
      {/* A lighter inner disc echoes the warm gradient in the logo's sun. */}
      <View style={{position:'absolute',width:core*0.5,height:core*0.5,borderRadius:core*0.25,backgroundColor:colors.goldSoft,opacity:.85}}/>
    </View>
  );
}
