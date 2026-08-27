// Spec 8, the Mindfulness Corner. Every practice here answers section 8.1's single
// question: does this help the nervous system shift safely from one state to another?
//
// The content is deliberately non-directive and makes no treatment claims — spec 3,
// Stage 3 sets the boundary "do not imply clinical treatment efficacy". Steps are
// paced by the user, never by a timer, so nothing here can be failed or fallen behind.
//
// kind: 'paced'  — tap through at your own pace
//       'breath' — the 4-2-6 pacer from 8.2
//       'silence'— no guidance at all

export const PRACTICES={
  downshift:{
    group:'sleep',name:'Nervous System Downshift',blurb:'For a body that is still running when the day has stopped.',
    kind:'paced',steps:[
      'Let the phone rest somewhere you do not have to hold it.',
      'You are not trying to fall asleep. You are only letting the day finish.',
      'Notice where your body is touching the bed. Start with the heaviest point.',
      'Let your jaw be slightly apart. Most people hold it closed all night.',
      'Let your breath out slowly, without making the in-breath bigger first.',
      'If your mind starts planning, that is not a failure. Let the thought finish, then come back to the weight of your body.',
      'Nothing else is required of you tonight.',
    ]},
  somatic:{
    group:'sleep',name:'Somatic Sleep Release',blurb:'Working down through the body, letting each part stop working.',
    kind:'paced',steps:[
      'Begin at the top of your head and let it be heavy.',
      'Let your forehead be smooth. Let the space between your eyebrows open.',
      'Let your eyes rest in their sockets rather than holding themselves still.',
      'Let your shoulders drop away from your ears, further than feels necessary.',
      'Let your hands be open, or curled — whichever asks less.',
      'Let your stomach be soft. It does not need to be held in here.',
      'Let your legs be heavy, and your feet fall outward.',
      'The whole body, off duty.',
    ]},
  unhooking:{
    group:'sleep',name:'Emotional Unhooking',blurb:'For nights where one thing will not let go of you.',
    kind:'paced',steps:[
      'Name the thing that is holding on. You do not have to solve it.',
      'It is allowed to still matter in the morning.',
      'Put it somewhere for the night — a shelf, a drawer, outside the door.',
      'It has not been dismissed. It has been set down.',
      'If it comes back, set it down again. You may do this many times.',
      'Setting it down repeatedly is the practice. It is not a sign it failed.',
    ]},
  drift:{
    group:'sleep',name:'Drift Support',blurb:'A long, slow, low-content place to lie until sleep arrives, or does not.',
    kind:'paced',steps:[
      'There is nothing to follow closely here.',
      'A room somewhere with the light off.',
      'Rain on a roof that is not your responsibility.',
      'A long road at night, with someone else driving.',
      'A house where everyone else is already asleep.',
      'Stay as long as you like. Nothing will interrupt you.',
    ]},

  anchoring:{
    group:'ground',name:'Sensory Anchoring',blurb:'The 5-4-3-2-1 orientation, one sense at a time.',
    kind:'paced',steps:[
      'Notice five things you can see. Let your eyes rest on each before moving on.',
      'Notice four things you can touch. The floor counts. So does your own hand.',
      'Notice three things you can hear, including the sounds underneath the obvious ones.',
      'Notice two things you can smell, or two you remember clearly.',
      'Notice one thing you can taste, or one you would like to.',
      'You arrived. That counts.',
    ]},
  breath:{
    group:'ground',name:'Breath Pacing',blurb:'A 4-2-6 rhythm, with a longer out-breath than in.',
    kind:'breath'},
  orientation:{
    group:'ground',name:'You Are Here',blurb:'For when the present tense has gone somewhere else.',
    kind:'paced',steps:[
      'Say where you are. Out loud, if you can.',
      'Say what day it is, even if you have to check.',
      'Name your age now — not the age you feel.',
      'Find something in the room that did not exist in the memory.',
      'Put your hand flat on a surface and press until you can feel it push back.',
      'You are here, and the present tense still holds you.',
    ]},

  coregulation:{
    group:'presence',name:'Co-Regulation',blurb:'A quiet presence that stays, and asks nothing of you.',
    kind:'paced',steps:[
      'You do not have to talk.',
      'I am here.',
      'Nothing needs deciding while you are like this.',
      'You are not too much.',
      'Breathe out. That is all.',
      'Still here.',
      'You are not alone.',
    ]},
  silence:{
    group:'presence',name:'Silence Mode',blurb:'No guidance, no prompts, nothing to do.',
    kind:'silence'},
};

export const GROUPS=[
  ['sleep','At night','Nocturnal regulation for insomnia, and for the nights sleep does not come.'],
  ['ground','Grounding','For dissociation, panic, and losing the present tense.'],
  ['presence','Presence','Company without conversation.'],
];
