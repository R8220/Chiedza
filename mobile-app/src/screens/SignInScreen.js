import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {Screen,Card,Field,Input,Button,Notice,Meta} from '../components/UI';
import {useAuth} from '../context/AuthContext';
import {colors,spacing,fonts,type} from '../theme';

export default function SignInScreen({navigation}){
  const auth=useAuth();
  const [email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const ready=email.trim()&&password;

  async function submit(){
    if(!ready||busy)return;
    setBusy(true); setError('');
    try{await auth.login(email.trim(),password);}
    catch(e){setError(e.message);}
    finally{setBusy(false);}
  }

  return (
    <Screen avoidKeyboard>
      <View style={s.hero}>
        <Text style={type.label}>Welcome back</Text>
        <Text style={s.heroTitle}>Come in.</Text>
        <View style={s.rule}/>
        <Text style={[type.subtle,{fontSize:16}]}>Continuous emotional care, at whatever pace you have today.</Text>
      </View>

      <Card>
        <Field label="Email">
          <Input autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            textContentType="emailAddress" placeholder="you@example.com"
            value={email} onChangeText={setEmail} returnKeyType="next"/>
        </Field>
        <Field label="Password">
          <Input secureTextEntry textContentType="password" placeholder="Your password"
            value={password} onChangeText={setPassword} returnKeyType="go" onSubmitEditing={submit}/>
        </Field>
        {error?<Notice danger>{error}</Notice>:null}
        <Button title={busy?'Signing you in…':'Sign in'} onPress={submit} disabled={!ready||busy}/>
      </Card>

      <Pressable onPress={()=>navigation.navigate('SignUp')} style={s.switch} accessibilityRole="button">
        <Text style={s.switchText}>New here? Create your place</Text>
        <Feather name="arrow-right" size={16} color={colors.sepia}/>
      </Pressable>

      <Notice>Chiedza is not an emergency service and does not replace a licensed clinician. High-risk content is designed to enter a human review pathway.</Notice>
      <Meta>Your account is yours. You choose what is visible, shared and active.</Meta>
    </Screen>
  );
}

const s=StyleSheet.create({
  hero:{paddingTop:spacing.md,gap:spacing.xs,overflow:'hidden'},
  heroTitle:{fontFamily:fonts.display,fontSize:48,lineHeight:54,color:colors.ink,marginTop:spacing.xs},
  rule:{width:52,height:1,backgroundColor:colors.gold,marginVertical:spacing.md,opacity:.7},
  switch:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingVertical:spacing.sm},
  switchText:{fontFamily:fonts.serif,fontSize:17,color:colors.sepia},
});
