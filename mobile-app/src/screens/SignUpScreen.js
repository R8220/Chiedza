import React,{useState} from 'react';
import {View,Text,Pressable,StyleSheet} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {Screen,Card,Field,Input,Button,Notice,Meta} from '../components/UI';
import {useAuth} from '../context/AuthContext';
import {colors,spacing,fonts,type} from '../theme';

// Mirrors the server rules in mobileApi.js: name, a valid email, and 8+ characters.
const emailLooksValid=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function SignUpScreen({navigation}){
  const auth=useAuth();
  const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const ready=name.trim()&&emailLooksValid(email)&&password.length>=8;

  async function submit(){
    if(busy)return;
    if(!name.trim())return setError('Please tell us what to call you.');
    if(!emailLooksValid(email))return setError('That email address does not look complete.');
    if(password.length<8)return setError('Please choose a password of at least 8 characters.');
    setBusy(true); setError('');
    try{await auth.register(name.trim(),email.trim(),password);}
    catch(e){setError(e.message);}
    finally{setBusy(false);}
  }

  return (
    <Screen avoidKeyboard>
      <View style={s.hero}>
        <Text style={type.label}>Create your place</Text>
        <Text style={s.heroTitle}>Begin gently.</Text>
        <View style={s.rule}/>
        <Text style={[type.subtle,{fontSize:16}]}>Nothing here asks you to perform. You decide what to share, and when.</Text>
      </View>

      <Card>
        <Field label="What should we call you">
          <Input placeholder="Your name" textContentType="name" autoCapitalize="words"
            value={name} onChangeText={setName} returnKeyType="next"/>
        </Field>
        <Field label="Email">
          <Input autoCapitalize="none" autoCorrect={false} keyboardType="email-address"
            textContentType="emailAddress" placeholder="you@example.com"
            value={email} onChangeText={setEmail} returnKeyType="next"/>
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input secureTextEntry textContentType="newPassword" placeholder="Choose a password"
            value={password} onChangeText={setPassword} returnKeyType="go" onSubmitEditing={submit}/>
        </Field>
        {error?<Notice danger>{error}</Notice>:null}
        <Button title={busy?'Making your place…':'Create account'} onPress={submit} disabled={!ready||busy}/>
      </Card>

      <Pressable onPress={()=>navigation.navigate('SignIn')} style={s.switch} accessibilityRole="button">
        <Feather name="arrow-left" size={16} color={colors.sepia}/>
        <Text style={s.switchText}>Already have an account? Sign in</Text>
      </Pressable>

      <Notice>Chiedza is not an emergency service and does not replace a licensed clinician. High-risk content is designed to enter a human review pathway.</Notice>
      <Meta>Sensitive text is encrypted at rest. Consent controls are yours to change at any time in Settings.</Meta>
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
