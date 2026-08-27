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
// Near-square corners. Heavily rounded cards are the house style of generic app
// templates; the brand site sets its buttons and panels almost flat.
export const radius={sm:4,md:8,lg:14,xl:20,pill:999};

// The brand faces, taken from chiedzaco.com: Cormorant Garamond for display,
// Poppins for UI. Bundled in assets/fonts and loaded by expo-font in App.js.
export const fonts={
  display:'CormorantGaramond-SemiBold',
  displayRegular:'CormorantGaramond',
  displayItalic:'CormorantGaramond-Italic',
  serif:'CormorantGaramond-Medium',
  sans:'Poppins',
  sansMedium:'Poppins-Medium',
  sansSemiBold:'Poppins-SemiBold',
};

// Cormorant has a small x-height and fine strokes, so display sizes run larger
// and body text stays on Poppins rather than being set in the display face.
export const type={
  hero:{fontFamily:fonts.display,fontSize:46,lineHeight:52,color:colors.ink},
  title:{fontFamily:fonts.display,fontSize:34,lineHeight:41,color:colors.ink},
  heading:{fontFamily:fonts.serif,fontSize:23,lineHeight:30,color:colors.ink},
  body:{fontFamily:fonts.sans,fontSize:15,lineHeight:25,color:colors.inkSoft},
  subtle:{fontFamily:fonts.sans,fontSize:14.5,lineHeight:24,color:colors.muted},
  // Wide-tracked micro caps, as the brand site sets its eyebrows.
  label:{fontFamily:fonts.sansMedium,fontSize:10.5,color:colors.sepia,textTransform:'uppercase',letterSpacing:2.2},
  meta:{fontFamily:fonts.sans,fontSize:12.5,lineHeight:19,color:colors.muted},
};

// Restrained to near-nothing: the layout is held by hairlines and space, not by
// drop shadows, which is what separates an editorial surface from a card template.
export const shadow={
  card:Platform.select({
    ios:{shadowColor:'#4A3A24',shadowOpacity:.04,shadowRadius:10,shadowOffset:{width:0,height:3}},
    android:{elevation:1},
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
