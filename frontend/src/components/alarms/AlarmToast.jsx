import { useState } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';
import { useAlarms } from '../../contexts/AlarmContext';
import '../../styles/AlarmToast.css';

/**
 * Integrato con Material-UI Snackbar component
 * 
 * Metodi seguono diagramma UML sequenze caso d'uso "Presa Visione"
 */
function AlarmToast({ alarm, index }) {
  const [open, setOpen] = useState(true);
  const { markAsSeen } = useAlarms();

  // Trigger: click button → aggiorna stato → chiude toast
  const clickPresaVisione = (idAllarme) => {
    console.log('clickPresaVisione() chiamato per allarme:', idAllarme);
    
    // 1. Setta allarme come visto
    setAllarmeVisto(idAllarme);
    
    // 2. Aggiorna icona badge
    aggiornaIconaVisto();
    
    // 3. Chiude toast
    setOpen(false);
  };

 
  // Frontend → Backend: setAllarmeVisto(idAllarme)
  const setAllarmeVisto = (idAllarme) => {
    console.log('setAllarmeVisto() - aggiorno stato locale');
    
    markAsSeen(idAllarme);
  };

  // Frontend: aggiornaIconaVisto() → decrementa unseenCount
  const aggiornaIconaVisto = () => {
    console.log('aggiornaIconaVisto() - il Context decrementa unseenCount automaticamente');
    // Il badge si aggiorna automaticamente tramite Context
    // perché markAsSeen() decrementa unseenCount
  };

  // Chiudo toast senza presa visione (click X)
  const handleClose = () => {
    setOpen(false);
  };
  
  const topOffset = 16 + index * 90; // per ogni toast

  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={(_, reason) => { if (reason !== 'clickaway') setOpen(false); }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      style={{ top: topOffset }}
      className="alarm-toast-snackbar"
    >
      <Alert
        severity="error"
        variant="filled"
        onClose={handleClose}
        className="alarm-toast-alert"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => clickPresaVisione(alarm.id)}
            className="alarm-toast-button"
          >
            Presa Visione
          </Button>
        }
      >
        <strong>🚨 Nuovo Allarme!</strong><br />
        Veicolo: {alarm.targa}<br />
        Causa: {alarm.causa}
      </Alert>
    </Snackbar>
  );
}

export default AlarmToast;

