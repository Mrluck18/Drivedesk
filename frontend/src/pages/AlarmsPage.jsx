import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack
} from '@mui/material';
import { 
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAlarms } from '../contexts/AlarmContext';
import '../styles/AlarmsPage.css';

/**
 * Pagina Gestione Allarmi
 * Mostra tutti gli allarmi della flotta con possibilità di filtro
 */
function AlarmsPage() {
 
  const { alarms, markAsSeen, markAsResolved } = useAlarms();
  const [filter, setFilter] = useState('all'); // Filtro corrente

  // Filtra allarmi in base allo stato selezionato
  const filteredAlarms = alarms.filter(alarm => {
    if (filter === 'all') return true;
    return alarm.stato === filter;
  });

  // Formatta timestamp in formato leggibile
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Colore chip in base allo stato
  const getStatoColor = (stato) => {
    if (stato === 'nuovo') return 'error';
    if (stato === 'gestione') return 'warning';
    if (stato === 'risolto') return 'success';
    return 'default';
  };

  // Label tradotta stato
  const getStatoLabel = (stato) => {
    const labels = {
      'nuovo': 'Nuovo',
      'gestione': 'In gestione',
      'risolto': 'Risolto'
    };
    return labels[stato] || stato;
  };

  // Conta allarmi per ogni stato
  const countByStatus = (status) => {
    return alarms.filter(a => a.stato === status).length;
  };

  return (
    <DashboardLayout>
      <Box className="alarms-page">
        
        {/* Header pagina */}
        <Box className="alarms-header">
          <Typography variant="h4" className="alarms-title">
            Gestione Allarmi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Totale allarmi: {alarms.length}
          </Typography>
        </Box>

        {/* Filtri */}
        <Stack direction="row" spacing={1} className="alarms-filters">
          <Button 
            variant={filter === 'all' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('all')}
            size="small"
          >
            Tutti ({alarms.length})
          </Button>
          <Button 
            variant={filter === 'nuovo' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('nuovo')}
            color="error"
            size="small"
            startIcon={<WarningIcon />}
          >
            Nuovi ({countByStatus('nuovo')})
          </Button>
          <Button 
            variant={filter === 'gestione' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('gestione')}
            color="warning"
            size="small"
            startIcon={<BuildIcon />}
          >
            In Gestione ({countByStatus('gestione')})
          </Button>
          <Button 
            variant={filter === 'risolto' ? 'contained' : 'outlined'} 
            onClick={() => setFilter('risolto')}
            color="success"
            size="small"
            startIcon={<CheckIcon />}
          >
            Risolti ({countByStatus('risolto')})
          </Button>
        </Stack>

        {/* Messaggio se nessun allarme */}
        {filteredAlarms.length === 0 && (
          <Alert severity="info" className="alarms-empty">
            Nessun allarme da visualizzare per il filtro selezionato
          </Alert>
        )}

        {/* Tabella allarmi */}
        {filteredAlarms.length > 0 && (
          <TableContainer component={Paper} className="alarms-table-container">
            <Table>
              <TableHead>
                <TableRow className="alarms-table-head">
                  <TableCell><strong>Stato</strong></TableCell>
                  <TableCell><strong>Targa</strong></TableCell>
                  <TableCell><strong>Causa</strong></TableCell>
                  <TableCell><strong>Categoria</strong></TableCell>
                  <TableCell><strong>Data/Ora</strong></TableCell>
                  <TableCell align="center"><strong>Azioni</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAlarms.map((alarm) => (
                  <TableRow 
                    key={alarm.id}
                    className={`alarms-table-row ${alarm.stato === 'nuovo' ? 'alarm-new' : ''}`}
                  >
                    {/* Colonna Stato */}
                    <TableCell>
                      <Chip 
                        label={getStatoLabel(alarm.stato)}
                        color={getStatoColor(alarm.stato)}
                        size="small"
                        icon={alarm.stato === 'nuovo' ? <WarningIcon /> : undefined}
                      />
                    </TableCell>

                    {/* Colonna Targa */}
                    <TableCell>
                      <Typography fontWeight="bold" className="alarm-targa">
                        {alarm.targa}
                      </Typography>
                    </TableCell>

                    {/* Colonna Causa */}
                    <TableCell className="alarm-causa">
                      {alarm.causa}
                    </TableCell>

                    {/* Colonna Categoria */}
                    <TableCell>
                      <Chip 
                        label={alarm.categoria || 'N/A'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Colonna Data/Ora */}
                    <TableCell className="alarm-timestamp">
                      {formatDate(alarm.timestamp)}
                    </TableCell>

                    <TableCell align="center">
                      {/*Pulsante "Prendi in carico" */}
                      {alarm.stato === 'nuovo' && (
                        <Button 
                          variant="contained" 
                          size="small"
                          color="primary"
                          onClick={() => markAsSeen(alarm.id)}
                        >
                          Prendi in carico
                        </Button>
                      )}
                      
                      {/* Pulsante "Risolvi" */}
                      {alarm.stato === 'gestione' && (
                        <Button 
                          variant="contained" 
                          size="small"
                          color="success"
                          onClick={() => markAsResolved(alarm.id)}
                          startIcon={<CheckIcon />}
                        >
                          Risolvi
                        </Button>
                      )}
                      
                      {/*RISOLTO Icona check + testo */}
                      {alarm.stato === 'risolto' && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: 1 
                        }}>
                          <CheckIcon color="success" />
                          <Typography 
                            variant="caption" 
                            color="success.main" 
                            fontWeight="600"
                          >
                            Completato
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default AlarmsPage;

