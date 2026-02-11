import { Card, CardContent, Typography, Chip, Box, LinearProgress, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  DirectionsCar as DirectionsCarIcon, 
  LocationOn as LocationOnIcon,
  Speed as SpeedIcon,
  LocalGasStation as GasIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import '../../styles/VehicleCard.css';

// Card singola per mostrare info veicolo
function VehicleCard({ vehicle, onDelete }) {
  
  const getStatoLabel = (stato) => {
    const labels = {
      'movimento': 'In viaggio',
      'sosta': 'Fermo',
      'allarme': 'Allarme'
    };
    return labels[stato] || stato;
  };
   
  // Funzione per decidere colore chip in base allo stato
   const getStatoColor = (stato) => {
    if (stato === 'movimento') return 'success';   // verde
    if (stato === 'allarme') return 'error';       // rosso
    return 'default'; // grigio per "sosta"
  };

  // Funzione per aggiungere classe CSS custom al Chip
   const getChipClassName = (stato) => {
    if (stato === 'movimento') return 'status-chip-success';
    if (stato === 'allarme') return 'status-chip-warning';
    return 'status-chip-default';
  };
   
  // Funzione per classe CSS barra carburante
   const getFuelLevelClass = (livello) => {
    if (livello <= 15) return 'critical';  // rosso
    if (livello <= 30) return 'low';       // arancione
    return 'normal';                       // verde
  };

  // Controlla se l'aggiornamento è recente (< 5 minuti)
  const isRecent = (timestamp) => {
    if (!timestamp) return false;
    const diffMinutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    return diffMinutes < 5;
  };

  // Formatta data ultimo aggiornamento
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);
    
    if (diffMinutes < 1) return 'Adesso';
    if (diffMinutes < 60) return `${diffMinutes}m fa`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h fa`;
    return date.toLocaleDateString('it-IT');
  };
     
  return (
    <Card className={`vehicle-card ${vehicle.stato === 'allarme' ? 'alarm-active' : ''}`}>
      <CardContent>
        
        {/* Header: icona + targa + stato */}
        <Box className="vehicle-card-header">
          {/* Icona + targa */}
          <Box className="vehicle-targa-box">
            <DirectionsCarIcon className="vehicle-icon" />
            <Typography variant="h6" className="vehicle-targa">
              {vehicle.targa}
            </Typography>
          </Box>
          
          {/* Chip stato */}
          <Chip
            label={getStatoLabel(vehicle.stato)}
            color={getStatoColor(vehicle.stato)}
            size="small"
            className={getChipClassName(vehicle.stato)}
          />
        </Box>

        {/* Sezione info autista */}
        <Box className="vehicle-info-section">
          <Typography variant="body2" className="vehicle-info">
            <span className="vehicle-info-label">Autista:</span> {vehicle.nomeAutista}
          </Typography>
          <Typography variant="body2" className="vehicle-info">
            <span className="vehicle-info-label">Tel:</span> {vehicle.numeroAutista}
          </Typography>
        </Box>
        
        {/* Velocità */}
        {vehicle.velocita !== undefined && (
          <Box className="vehicle-speed-section">
            <SpeedIcon className="vehicle-speed-icon" />
            <Typography className="vehicle-speed-text">
              Velocità: 
              <span className="vehicle-speed-value">{vehicle.velocita} km/h</span>
            </Typography>
          </Box>
        )}
        
        {/* Carburante */}
        {vehicle.livelloCarburante !== undefined && (
          <Box className="vehicle-fuel-section">
            <Box className="vehicle-fuel-header">
              <Box className="vehicle-fuel-label">
                <GasIcon className="vehicle-fuel-icon" />
                <span>Carburante</span>
              </Box>
              <Typography className="vehicle-fuel-percentage">
                {vehicle.livelloCarburante}%
              </Typography>
            </Box>
            <LinearProgress 
              className={`vehicle-fuel-bar fuel-bar-${getFuelLevelClass(vehicle.livelloCarburante)}`}
              variant="determinate" 
              value={vehicle.livelloCarburante}
            />
          </Box>
        )}

        {/* Posizione GPS se disponibile */}
        {vehicle.posizione && vehicle.posizione !== '0,0' && (
          <Box className="vehicle-gps-section">
            <LocationOnIcon className="vehicle-gps-icon" />
            <Typography variant="caption" className="vehicle-gps-text">
              📍 GPS: {vehicle.posizione}
            </Typography>
          </Box>
        )}
        
        {/* Ultimo aggiornamento */}
        {vehicle.ultimoAggiornamento && (
          <Box className={`vehicle-update-section ${isRecent(vehicle.ultimoAggiornamento) ? 'recent' : ''}`}>
            <TimeIcon className="vehicle-update-icon" />
            <Typography className="vehicle-update-text">
              Aggiornato: {formatLastUpdate(vehicle.ultimoAggiornamento)}
            </Typography>
          </Box>
        )}
        
        {/* Bottone Elimina */}
        <IconButton
          size="small"
          color="error"
          onClick={() => {
            if (window.confirm(`Eliminare il veicolo ${vehicle.targa}?`)) {
              onDelete(vehicle._id);
            }
          }}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          title="Elimina veicolo"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>    
      </CardContent>
    </Card>   
  );
}

export default VehicleCard;

