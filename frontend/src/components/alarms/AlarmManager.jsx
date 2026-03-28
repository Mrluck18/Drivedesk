import { useEffect } from 'react';
import { socketService } from '../../services/socket';
import { useAlarms } from '../../contexts/AlarmContext';
import AlarmToast from './AlarmToast';

/**
 * AlarmManager - Componente UI per visualizzare toast di allarmi
 * 
 * Riceve allarmi dal Context e renderizza toast per quelli non ancora visti.
 * 
 * Nota: La ricezione real-time via Socket.IO è gestita in AlarmContext.
 */
 
function AlarmManager() {
  const { alarms } = useAlarms();

  const unseenAlarms = alarms.filter(alarm => alarm.stato === 'nuovo');

  return (
    <>
      {unseenAlarms.map((alarm, index) => (
        <AlarmToast key={alarm.id} alarm={alarm} index={index} />
      ))}
    </>
  );
}

export default AlarmManager;

