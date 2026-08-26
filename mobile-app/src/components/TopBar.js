import React from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Feather} from '@expo/vector-icons';
import {colors,spacing,type,fonts} from '../theme';
import SunMark from './SunMark';

const initialsOf=name=>String(name||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'·';

export default function TopBar({title,eyebrow,onBack,user,onPressProfile,right}){
  const insets=useSafeAreaInsets();
  return (
    <View style={[s.wrap,{paddingTop:insets.top+spacing.sm}]}>
      <View style={s.row}>
        <View style={s.left}>
          {onBack?(
            <Pressable onPress={onBack} hitSlop={12} style={s.back} accessibilityRole="button" accessibilityLabel="Go back">
              <Feather name="chevron-left" size={22} color={colors.ink}/>
            </Pressable>
          ):null}
          {title?(
            <View style={{flex:1}}>
              {eyebrow?<Text style={s.eyebrow} numberOfLines={1}>{eyebrow}</Text>:null}
              <Text style={s.title} numberOfLines={1}>{title}</Text>
            </View>
          ):(
            <View style={s.brand}>
              <SunMark size={24}/>
              <Text style={s.wordmark}>Chiedza</Text>
            </View>
          )}
        </View>

        {right!==undefined?right:(
          user?(
            <Pressable onPress={onPressProfile} hitSlop={10} style={s.avatar} accessibilityRole="button" accessibilityLabel="Consent and settings">
              <Text style={s.avatarText}>{initialsOf(user.name)}</Text>
            </Pressable>
          ):null
        )}
      </View>
    </View>
  );
}

const s=StyleSheet.create({
  wrap:{backgroundColor:colors.cream,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:colors.line,paddingHorizontal:spacing.lg,paddingBottom:spacing.md},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:spacing.md},
  left:{flexDirection:'row',alignItems:'center',gap:spacing.sm,flex:1},
  back:{width:30,height:30,alignItems:'center',justifyContent:'center',marginLeft:-6},
  brand:{flexDirection:'row',alignItems:'center',gap:spacing.sm},
  // Wide tracking on the wordmark is what makes a masthead feel considered.
  wordmark:{fontFamily:fonts.display,fontSize:23,color:colors.ink,letterSpacing:2.6},
  title:{fontFamily:fonts.display,fontSize:23,color:colors.ink,letterSpacing:.3},
  eyebrow:{...type.label,fontSize:10,letterSpacing:1.4,marginBottom:2},
  avatar:{width:38,height:38,borderRadius:19,backgroundColor:colors.creamLift,borderWidth:1,borderColor:colors.goldSoft,alignItems:'center',justifyContent:'center'},
  avatarText:{fontFamily:fonts.serif,fontSize:14,color:colors.sepia,letterSpacing:.8},
});
