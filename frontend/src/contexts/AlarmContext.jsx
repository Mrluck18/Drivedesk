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
    
    // Funzione per caricare storico allarmi da GET /api/allarmi
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
        
        console.log(`Storico caricato: ${formattedAlarms.length} allarmi (${newCount} non visti)`);
      } catch (error) {
        console.error('Errore caricamento allarmi:', error);
      }
    };
  
    // Inizializza SOLO se utente è autenticato
    if (isAuthenticated && !isInitialized) {
      console.log('Utente autenticato - inizializzo AlarmContext');
      
      // Carica storico allarmi da backend
      fetchAlarms();

      // Listener Socket.IO per nuovi allarmi real-time
      console.log('Attivo ascolto evento "nuovoAllarme"');
      socketService.onNewAlarm((socketAlarm) => {
        console.log('SOCKET EVENTO RICEVUTO:', socketAlarm);
        
        // Crea oggetto allarme formattato per lo stato locale
        const newAlarm = {
          id: socketAlarm.idAllarme,
          targa: socketAlarm.targa,
          causa: socketAlarm.messaggio,
          categoria: 'medio',
          stato: 'nuovo',
          timestamp: new Date().toISOString()
        };
        
        // Aggiungi allarme alla lista con controllo duplicati
        // (previene doppie notifiche se stesso evento arriva più volte)
        setAlarms((prevAlarms) => {
          const exists = prevAlarms.some(a => a.id === newAlarm.id);
          if (exists) {
            console.warn('Allarme duplicato ignorato:', newAlarm.id);
            return prevAlarms; // Non aggiungere se già presente
          }
          console.log('➕ Aggiungo nuovo allarme alla lista');
          // Aggiungo nuovo allarme in testa all'array (eventi più recenti prima)
          return [newAlarm, ...prevAlarms];
        });
        
        // Incremento contatore non visti
        setUnseenCount((prevCount) => {
          const newCount = prevCount + 1;
          console.log(`Badge incrementato: ${prevCount} → ${newCount}`);
          return newCount;
        });
      });

      setIsInitialized(true);
    }

    // Cleanup quando user fa logout
    if (!isAuthenticated && isInitialized) {
      console.log('🔌 Logout - pulisco AlarmContext');
      socketService.offNewAlarm(); // Rimuovi listener socket
      setAlarms([]);
      setUnseenCount(0);
      setIsInitialized(false);
    }

    // Cleanup function: eseguita quando componente si smonta
    // o quando isAuthenticated/isInitialized cambiano
    return () => {
      if (isAuthenticated && isInitialized) {
        console.log('Cleanup: rimuovo listener socket');
        socketService.offNewAlarm();
      }
    };
  }, [isAuthenticated, isInitialized]);

  // Funzione per marcare allarme come "in gestione"
  // Chiamata quando utente clicca "Presa Visione" su toast o modifica stato
  const markAsSeen = async (alarmId) => {
    console.log('Marco allarme come visto:', alarmId);
    try {
      // PATCH /api/allarmi/:id - aggiorna stato su backend
      await alarmsAPI.updateStatus(alarmId, 'gestione');

      // Aggiorna stato dell'allarme specifico nello stato locale
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
      console.log('Allarme marcato come in gestione');
    } catch (error) {
      console.error('Errore aggiornamento allarme:', error);
    }
  };

  // Funzione per marcare allarme come "risolto"
  // Chiamata quando manager risolve completamente l'allarme
  const markAsResolved = async (alarmId) => {
    console.log('Marco allarme come risolto:', alarmId);
    try {
      // PATCH /api/allarmi/:id - aggiorna stato su backend
      await alarmsAPI.updateStatus(alarmId, 'risolto');

      // Aggiorna stato dell'allarme specifico nello stato locale
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

  // Valori e funzioni da passare ai componenti tramite Context
  const value = {
    alarms: alarms,
    unseenCount: unseenCount,
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
// Lancia errore se usato fuori da AlarmProvider
export function useAlarms() {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarms va usato dentro AlarmProvider!');
  }
  return context;
}

