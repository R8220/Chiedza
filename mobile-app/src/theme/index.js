import {Platform} from 'react-native';

// Brand palette from the specification: Cream, Sepia, Lantern Gold, Ink, Soft Rose, Moss.
// Gold is an accent only — hairlines, small marks, single details. Never a large fill.
export const colors={
  cream:'#F5EFE4',creamDeep:'#EFE7D9',creamLift:'#FBF6EC',
  sepia:'#8B6F47',sepiaSoft:'#A08A67',
  gold:'#C9954A',goldSoft:'#E2C08A',goldWash:'#F3E6CE',
  ink:'#2B2118',inkSoft:'#4A3D30',
  rose:'#C99A95',roseWash:'#F1E0DD',
  moss:'#6B7855',mossWash:'#E3E7DB',
  white:'#FFFDF9',
  danger:'#8A3B3B',dangerWash:'#F2E2E0',
  muted:'#7A7066',
  line:'#E7DDCF',lineSoft:'#F0E8DB',
};

export const spacing={xs:6,sm:10,md:16,lg:24,xl:32,xxl:44};
export const radius={sm:12,md:18,lg:24,xl:30,pill:999};

// iOS ships Didot and Baskerville; both carry the Cormorant/Lora editorial feeling
// without shipping font binaries (which would need an asset pipeline and a rebuild).
export const fonts={
  display:Platform.select({ios:'Didot',android:'serif',default:'serif'}),
  displayMedium:Platform.select({ios:'Didot-Bold',android:'serif',default:'serif'}),
  serif:Platform.select({ios:'Baskerville',android:'serif',default:'serif'}),
  sans:Platform.select({ios:'Avenir Next',android:'sans-serif',default:'System'}),
};

export const type={
  hero:{fontFamily:fonts.display,fontSize:40,lineHeight:46,color:colors.ink,letterSpacing:.2},
  title:{fontFamily:fonts.display,fontSize:30,lineHeight:36,color:colors.ink,letterSpacing:.2},
  heading:{fontFamily:fonts.serif,fontSize:21,lineHeight:28,color:colors.ink},
  body:{fontFamily:fonts.sans,fontSize:16,lineHeight:25,color:colors.inkSoft},
  subtle:{fontFamily:fonts.sans,fontSize:15,lineHeight:23,color:colors.muted},
  // Wide-tracked micro caps are the signature of the editorial layer.
  label:{fontFamily:fonts.sans,fontSize:11,fontWeight:'600',color:colors.sepia,textTransform:'uppercase',letterSpacing:1.6},
  meta:{fontFamily:fonts.sans,fontSize:13,lineHeight:19,color:colors.muted},
};

// Wide, low-opacity shadows read as expensive; tight dark ones read as cheap.
export const shadow={
  card:Platform.select({
    ios:{shadowColor:'#4A3A24',shadowOpacity:.07,shadowRadius:22,shadowOffset:{width:0,height:10}},
    android:{elevation:2},
  }),
  raised:Platform.select({
    ios:{shadowColor:'#4A3A24',shadowOpacity:.12,shadowRadius:30,shadowOffset:{width:0,height:16}},
    android:{elevation:5},
  }),
};

// Care state → the one place a colour is allowed to carry meaning.
export const stateTone={
  stable:{tint:colors.moss,wash:colors.mossWash,label:'Stable'},
  settled:{tint:colors.moss,wash:colors.mossWash,label:'Settled'},
  struggling:{tint:colors.gold,wash:colors.goldWash,label:'Struggling'},
  overwhelmed:{tint:colors.rose,wash:colors.roseWash,label:'Overwhelmed'},
  high_risk:{tint:colors.danger,wash:colors.dangerWash,label:'High risk'},
  crisis:{tint:colors.danger,wash:colors.dangerWash,label:'Crisis'},
};
export const toneFor=key=>stateTone[String(key||'').toLowerCase().replace(/[\s-]/g,'_')]||{tint:colors.sepia,wash:colors.creamDeep,label:titleCase(key)};

export const titleCase=v=>String(v||'').replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()).trim();
