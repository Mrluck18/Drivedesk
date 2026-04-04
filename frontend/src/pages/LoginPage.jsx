import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EmailIcon from '@mui/icons-material/Email';
import '../styles/LoginPage.css';

function LoginPage() {
  // Stati per email e password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const renderDashboard = () => {
    console.log('renderDashboard() chiamato - vado alla dashboard');
    navigate('/dashboard');
  };

  const mostraErrore = (errorMessage) => {
    console.log('mostraErrore() chiamato:', errorMessage);
    setLocalError(errorMessage);
  };

  // Gestione submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); // pulisco errori precedenti
    
    // Validazione base
    if (!email) {
      mostraErrore('Inserisci una email');
      return;
    }
    if (!password) {
      mostraErrore('Inserisci una password');
      return;
    }

    console.log('Provo login...');
    setLoading(true);
    
    try {
      const result = await login(email, password);

      if (result.success) {
        // Login ok - vado a dashboard
        console.log('Login riuscito!');
        renderDashboard();
      } else {
        // Login fallito - mostro errore
        mostraErrore(result.error || 'Credenziali non valide');
      }
    } catch (err) {
      // Errori imprevisti (es. login() crashato)
      console.error('Errore durante login:', err);
      mostraErrore('Errore di connessione al server');
    } finally {
      setLoading(false);
    }
  };

// email precompilata per richiesta account
const mailtoLink = `mailto:it@drivedesk.it?subject=Richiesta Account DriveDesk&body=Buongiorno,%0D%0A%0D%0ARichiedo la creazione di un account Manager per il sistema DriveDesk.%0D%0A%0D%0ANome e Cognome: %0D%0AEmail aziendale: %0D%0AReparto: %0D%0AMotivazione: %0D%0A%0D%0AGrazie`;

  return (
    <Box className="login-container">
      <Card className="login-card">
        <CardContent sx={{ p: 4 }}>
        
          {/* Header con logo */}
          <Box className="login-header">
            <DirectionsCarIcon className="login-icon" />
            <Typography variant="h5" className="login-title">
              DriveDesk
            </Typography>
            <Typography variant="body2" className="login-subtitle">
              Sistema Gestione Flotta
            </Typography>
          </Box>
          
          {/* Messaggio errore */}
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          {/* Form login */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="testing@drivedesk.it"
              disabled={loading}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="test123"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              className="login-button"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>oppure</Divider>

          {/* Sezione Richiesta Account */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Non hai le credenziali?
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<EmailIcon />}
              href={mailtoLink}
              sx={{
                color: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Richiedi credenziali di accesso
            </Button>
          </Box>
          
          {/* Info credenziali test */}
          <Box className="demo-box">
            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Credenziali Demo:
            </Typography>
            <Box className="demo-text">
              testing@drivedesk.it / test123
            </Box>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;

