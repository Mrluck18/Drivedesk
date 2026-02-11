import { createContext, useContext, useState, useEffect } from 'react';
import { alarmsAPI } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

const AlarmContext = createContext();

/**
 * AlarmProvider - Gestisce stato degli allarmi real-time
 * Fornisce funzioni per gestire allarmi (nuovo -> gestione -> risolto)
 */
export function AlarmProvider({ children }) {
  // Lista di tutti gli allarmi ricevuti
  const [alarms, setAlarms] = useState([]);
  
  // Contatore allarmi non ancora visti
  // per aggiornare badge UI in real-time
  const [unseenCount, setUnseenCount] = useState(0);

  // Flag per evitare doppi fetch
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { isAuthenticated } = useAuth();

  // Caricamento iniziale allarmi + setup Socket.IO real-time
  useEffect(() => {
  console.log('AlarmContext check:', { isAuthenticated, isInitialized });
    
    // Inizializza SOLO se utente è autenticato
    if (isAuthenticated && !isInitialized) {
    console.log('Utente autenticato - inizializzo AlarmContext');
      
      // Carica storico allarmi da backend
      fetchAlarms();

      // Listener Socket.IO per nuovi allarmi real-time
      socketService.onNewAlarm((socketAlarm) => {
        console.log('Nuovo allarme ricevuto:', socketAlarm);
        const newAlarm = {
          id: socketAlarm.idAllarme,
          targa: socketAlarm.targa,
          causa: socketAlarm.messaggio,
          stato: 'nuovo',
          timestamp: new Date().toISOString()
        };
        addAlarm(newAlarm);
      });

      setIsInitialized(true);
    }

    // Cleanup quando user fa logout
    if (!isAuthenticated && isInitialized) {
      console.log('Logout - pulisco AlarmContext');
      setAlarms([]);
      setUnseenCount(0);
      setIsInitialized(false);
    }
  }, [isAuthenticated, isInitialized]);

  // Fetch allarmi iniziale da GET /api/allarmi
  
  const fetchAlarms = async () => {
    try {
      console.log('Carico storico allarmi da backend...');
      const backendAlarms = await alarmsAPI.getAll();
      
      const formattedAlarms = backendAlarms.map(alarm => ({
        id: alarm._id,
        targa: alarm.veicolo?.targa || 'N/A',
        causa: alarm.causa,
        categoria: alarm.categoria,
        stato: alarm.stato,
        timestamp: alarm.timestamp
      }));

      setAlarms(formattedAlarms);

      // Calcola quanti allarmi sono "nuovo" (non visti)
      const newCount = formattedAlarms.filter(a => a.stato === 'nuovo').length;
      setUnseenCount(newCount);
      
      console.log(`Caricati ${formattedAlarms.length} allarmi (${newCount} non visti)`);
    } catch (error) {
      console.error('Errore caricamento allarmi:', error);
    }
  };

  // Funzione per aggiungere nuovo allarme alla lista
  
  const addAlarm = (alarm) => {
    console.log('Nuovo allarme aggiunto:', alarm);
    
    // Aggiungo nuovo allarme in testa all'array (eventi più recenti prima)
    
    setAlarms(prevAlarms => [alarm, ...prevAlarms]);
    // Incremento contatore non visti
    setUnseenCount(prevCount => prevCount + 1);
  };

  // Funzione per marcare allarme come "in gestione"
  const markAsSeen = async (alarmId) => {
    console.log('Marco allarme come visto:', alarmId);
    try {
      // PATCH /api/allarmi/:id - aggiorna stato su backend
      
      await alarmsAPI.updateStatus(alarmId, 'gestione');

      // Aggiorna stato dell'allarme specifico
      
      setAlarms(prevAlarms =>
        prevAlarms.map(alarm => {
          if (alarm.id === alarmId) {
            return { ...alarm, stato: 'gestione' };
          }
          return alarm;
        })
      );

      // Decremento contatore (ma non deve andare sotto zero)
      setUnseenCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Errore aggiornamento allarme:', error);
    }
  };

  // Funzione per marcare allarme come "risolto"
  const markAsResolved = async (alarmId) => {
    console.log('Marco allarme come risolto:', alarmId);
    try {
      // PATCH /api/allarmi/:id - aggiorna stato su backend
      await alarmsAPI.updateStatus(alarmId, 'risolto');

      // Aggiorna stato dell'allarme specifico
      setAlarms(prevAlarms =>
        prevAlarms.map(alarm => {
          if (alarm.id === alarmId) {
            return { ...alarm, stato: 'risolto' };
          }
          return alarm;
        })
      );

      console.log('Allarme risolto con successo');
    } catch (error) {
      console.error('Errore risoluzione allarme:', error);
    }
  };

  // Valori e funzioni da passare ai componenti
  const value = {
    alarms: alarms,
    unseenCount: unseenCount,
    addAlarm: addAlarm,
    markAsSeen: markAsSeen,
    markAsResolved: markAsResolved,
  };

  return (
    <AlarmContext.Provider value={value}>
      {children}
    </AlarmContext.Provider>
  );
}

// Hook per usare allarmi nei componenti
export function useAlarms() {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarms va usato dentro AlarmProvider!');
  }
  return context;
}

