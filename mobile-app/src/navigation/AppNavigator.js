import React from 'react';
import {ActivityIndicator,View,StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Feather} from '@expo/vector-icons';
import {useAuth} from '../context/AuthContext';
import {colors,fonts} from '../theme';
import TopBar from '../components/TopBar';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ListenerScreen from '../screens/ListenerScreen';
import RoomsScreen from '../screens/RoomsScreen';
import JournalScreen from '../screens/JournalScreen';
import MoreScreen from '../screens/MoreScreen';
import RecoveryScreen from '../screens/RecoveryScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SessionsScreen from '../screens/SessionsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack=createNativeStackNavigator(),Tabs=createBottomTabNavigator();

const tabIcons={Home:'home',Listener:'message-circle',Rooms:'moon',Journal:'book-open',More:'more-horizontal'};
// Home wears the brand masthead; the rest carry their own name.
const tabHeaders={Listener:['The Listener','Say as much or as little as you have'],Rooms:['The Quiet Arcade','Rooms to enter and softly return from'],Journal:['Journal','Night pages, release and reflection'],More:['More care spaces','Open only what you have capacity for']};
// Grief Archive and Companion Mode are Phase 2/3 and are not part of this build.
const stackHeaders={Recovery:'Return to Self',Community:'Carry With Me',Sessions:'Sessions',Messages:'Secure Messages',Settings:'Consent & Control'};

function MainTabs(){
  const {user}=useAuth();
  const insets=useSafeAreaInsets();
  return (
    <Tabs.Navigator screenOptions={({route,navigation})=>{
      const head=tabHeaders[route.name];
      return {
        header:()=><TopBar title={head?.[0]} eyebrow={head?.[1]} user={user} onPressProfile={()=>navigation.navigate('Settings')}/>,
        tabBarActiveTintColor:colors.ink,
        tabBarInactiveTintColor:colors.muted,
        tabBarStyle:[s.tabBar,{height:58+insets.bottom,paddingBottom:insets.bottom||8}],
        tabBarLabelStyle:s.tabLabel,
        tabBarItemStyle:{paddingTop:6},
        tabBarIcon:({color,focused})=><Feather name={tabIcons[route.name]} size={focused?21:20} color={color}/>,
      };
    }}>
      <Tabs.Screen name="Home" component={HomeScreen}/>
      <Tabs.Screen name="Listener" component={ListenerScreen}/>
      <Tabs.Screen name="Rooms" component={RoomsScreen}/>
      <Tabs.Screen name="Journal" component={JournalScreen}/>
      <Tabs.Screen name="More" component={MoreScreen}/>
    </Tabs.Navigator>
  );
}

export default function AppNavigator(){
  const {user,loading}=useAuth();
  if(loading)return <View style={s.splash}><ActivityIndicator color={colors.sepia}/></View>;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{contentStyle:{backgroundColor:colors.cream}}}>
        {!user?(
          <>
            {/* Signed out: the masthead stands in for a nav bar, since there is nowhere else to go. */}
            <Stack.Screen name="SignIn" component={SignInScreen} options={{header:()=><TopBar/>}}/>
            <Stack.Screen name="SignUp" component={SignUpScreen}
              options={({navigation})=>({header:()=><TopBar title="Create your place" onBack={()=>navigation.goBack()} right={null}/>})}/>
          </>
        ):!user.onboardingComplete?(
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{header:()=><TopBar/>}}/>
        ):(
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{headerShown:false}}/>
            {Object.entries(stackHeaders).map(([name,label])=>(
              <Stack.Screen key={name} name={name} component={{Recovery:RecoveryScreen,Community:CommunityScreen,Sessions:SessionsScreen,Messages:MessagesScreen,Settings:SettingsScreen}[name]}
                options={({navigation})=>({header:()=><TopBar title={label} onBack={()=>navigation.goBack()} right={null}/>})}/>
            ))}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const s=StyleSheet.create({
  splash:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:colors.cream},
  tabBar:{backgroundColor:colors.white,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:colors.line,paddingTop:6},
  tabLabel:{fontFamily:fonts.sans,fontSize:10.5,fontWeight:'600',letterSpacing:.5,marginTop:2},
});
