import React from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,ScrollView,ActivityIndicator} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {colors,spacing,radius,type,fonts,shadow} from '../theme';

export function Screen({children,scroll=true,contentStyle}){
  const body=<View style={[s.body,contentStyle]}>{children}</View>;
  return scroll
    ?<ScrollView style={s.screen} contentContainerStyle={{flexGrow:1,paddingBottom:spacing.xxl}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{body}</ScrollView>
    :<View style={s.screen}>{body}</View>;
}

export const Title=({children,style})=><Text style={[type.title,style]}>{children}</Text>;
export const Subtitle=({children,style})=><Text style={[type.subtle,style]}>{children}</Text>;
export const Label=({children,style})=><Text style={[type.label,style]}>{children}</Text>;
export const Body=({children,style})=><Text style={[type.body,style]}>{children}</Text>;
export const Meta=({children,style})=><Text style={[type.meta,style]}>{children}</Text>;

export function Card({children,style,tone}){
  return <View style={[s.card,tone&&{borderColor:tone},style]}>{children}</View>;
}

// A label with a hairline rule running to the edge — the editorial section divider.
export function SectionHeader({children,style}){
  return (
    <View style={[s.sectionHeader,style]}>
      <Text style={type.label}>{children}</Text>
      <View style={s.rule}/>
    </View>
  );
}

export const Divider=({style})=><View style={[s.divider,style]}/>;

export function Pill({children,tint=colors.sepia,wash=colors.creamDeep}){
  return (
    <View style={[s.pill,{backgroundColor:wash}]}>
      <View style={[s.pillDot,{backgroundColor:tint}]}/>
      <Text style={[s.pillText,{color:tint}]}>{children}</Text>
    </View>
  );
}

// The primary way into care on the home page: icon, intent, and a quiet chevron.
export function ChoiceCard({icon,title,description,onPress,tint=colors.sepia,wash=colors.creamDeep}){
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}
      style={({pressed})=>[s.choice,pressed&&{opacity:.75,transform:[{scale:.995}]}]}>
      <View style={[s.choiceIcon,{backgroundColor:wash}]}><Feather name={icon} size={18} color={tint}/></View>
      <View style={{flex:1,gap:2}}>
        <Text style={s.choiceTitle}>{title}</Text>
        {description?<Text style={type.meta}>{description}</Text>:null}
      </View>
      <Feather name="chevron-right" size={18} color={colors.sepiaSoft}/>
    </Pressable>
  );
}

export function Input(props){
  return <TextInput placeholderTextColor={colors.muted} {...props}
    style={[s.input,props.multiline&&{minHeight:120,paddingTop:14,textAlignVertical:'top'},props.style]}/>;
}

export function Button({title,onPress,secondary=false,disabled=false,style}){
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({pressed})=>[s.button,secondary&&s.buttonSecondary,disabled&&{opacity:.45},pressed&&!disabled&&{opacity:.85},style]}>
      <Text style={[s.buttonText,secondary&&{color:colors.ink}]}>{title}</Text>
    </Pressable>
  );
}

export function Notice({children,danger=false}){
  const tint=danger?colors.danger:colors.gold;
  return (
    <View style={[s.notice,{borderColor:danger?colors.dangerWash:colors.goldWash,backgroundColor:danger?colors.dangerWash:colors.goldWash}]}>
      <View style={[s.noticeAccent,{backgroundColor:tint}]}/>
      <Text style={[type.body,{flex:1,color:danger?colors.danger:colors.inkSoft,fontSize:15}]}>{children}</Text>
    </View>
  );
}

export const Loading=({message='Loading gently…'})=>(
  <View style={{padding:48,alignItems:'center',gap:spacing.md}}>
    <ActivityIndicator color={colors.sepia}/>
    <Text style={[type.meta,{textAlign:'center'}]}>{message}</Text>
  </View>
);

const s=StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.cream},
  body:{padding:spacing.lg,gap:spacing.lg},

  card:{backgroundColor:colors.white,borderRadius:radius.lg,padding:spacing.lg,borderWidth:1,borderColor:colors.line,gap:spacing.sm,...shadow.card},

  sectionHeader:{flexDirection:'row',alignItems:'center',gap:spacing.md},
  rule:{flex:1,height:StyleSheet.hairlineWidth,backgroundColor:colors.line},
  divider:{height:StyleSheet.hairlineWidth,backgroundColor:colors.line,marginVertical:spacing.xs},

  pill:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:11,paddingVertical:6,borderRadius:radius.pill,alignSelf:'flex-start'},
  pillDot:{width:6,height:6,borderRadius:3},
  pillText:{fontFamily:fonts.sans,fontSize:12,fontWeight:'600',letterSpacing:.5},

  choice:{flexDirection:'row',alignItems:'center',gap:spacing.md,backgroundColor:colors.white,borderRadius:radius.md,borderWidth:1,borderColor:colors.line,paddingVertical:16,paddingHorizontal:16,...shadow.card},
  choiceIcon:{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center'},
  choiceTitle:{fontFamily:fonts.serif,fontSize:17,color:colors.ink},

  input:{backgroundColor:colors.white,borderWidth:1,borderColor:colors.line,borderRadius:radius.sm,padding:15,fontSize:16,fontFamily:fonts.sans,color:colors.ink},

  button:{backgroundColor:colors.ink,borderRadius:radius.sm,paddingVertical:16,paddingHorizontal:20,alignItems:'center'},
  buttonSecondary:{backgroundColor:'transparent',borderWidth:1,borderColor:colors.line},
  buttonText:{color:colors.white,fontSize:15,fontFamily:fonts.sans,fontWeight:'600',letterSpacing:.3},

  notice:{flexDirection:'row',gap:spacing.md,padding:spacing.md,borderRadius:radius.md,borderWidth:1,alignItems:'flex-start'},
  noticeAccent:{width:3,alignSelf:'stretch',borderRadius:2},
});
