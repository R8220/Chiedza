import {useMemo} from 'react';
import {useAuth} from '../context/AuthContext';

// Spec 9.2 lists Low Battery Mode and reduced motion as accessibility commitments,
// and Layer 9 adapts the interface to the user's therapeutic mode. Both were stored
// on the user and read by nothing; this is the single place that turns them into
// behaviour. Low Battery implies reduced motion — 4.3 says it lowers stimulation.
export function useCareMode(){
  const {user}=useAuth();
  return useMemo(()=>{
    const reducedMotion=Boolean(user?.reducedMotion);
    const lowBattery=Boolean(user?.lowBatteryMode);
    const mode=user?.therapeuticMode||'recovery';
    return {
      reducedMotion,lowBattery,mode,
      animate:!reducedMotion&&!lowBattery,
      // Stabilisation and crisis modes call for low stimulation (Layer 9).
      quiet:lowBattery||mode==='stabilisation'||mode==='crisis',
    };
  },[user?.reducedMotion,user?.lowBatteryMode,user?.therapeuticMode]);
}
