import { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert, TextField, InputAdornment, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VehicleCard from './VehicleCard';
import { vehiclesAPI } from '../../services/api';
import '../../styles/VehicleGrid.css';

/**
 * VehicleGrid - Dashboard per visualizzazione flotta veicoli
 * 
 * Carica lista veicoli al mount iniziale e mostra in grid responsive.
 * 
 * Pattern UI da:
 * - Zeimpekis et al. [1] pag. 156-162 "Fleet Dashboard Design"
 */

function VehicleGrid() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


  // Carico veicoli quando componente si monta
  useEffect(() => {
    visualizzaFlotta();
  }, []);

  const visualizzaFlotta = () => {
    console.log('visualizzaFlotta() chiamato');
    getListaVeicoli();
  };

  // Zeimpekis [1] pag. 160 - "Real-time data fetching requirements"
  const getListaVeicoli = async () => {
    try {
      setLoading(true);
      console.log('getListaVeicoli() - carico veicoli da backend...');
      
      // Chiamata GET /api/veicoli per ottenere lista veicoli
      // Zeimpekis [1] pag. 161 descrive struttura simile con REST API
      const datiVeicoli = await vehiclesAPI.getAll();
      console.log('Dati veicoli ricevuti:', datiVeicoli.length);
      
      renderGriglia(datiVeicoli);
    } catch (err) {
      console.error('Errore caricamento veicoli:', err);
      setError(err.message || 'Errore nel caricamento dei veicoli');
    } finally {
      setLoading(false);
    }
  };
  
  // Filtra veicoli in base alla ricerca
  const filteredVehicles = vehicles.filter((vehicle) => {
   const search = searchTerm.toLowerCase();
   return (
     vehicle.targa.toLowerCase().includes(search) ||
     vehicle.nomeAutista.toLowerCase().includes(search) ||
     vehicle.numeroAutista.toLowerCase().includes(search) ||
     vehicle.stato.toLowerCase().includes(search)
    );
  });

  // Zeimpekis [1] pag. 162 - "Grid layout for fleet overview"
  const renderGriglia = (datiVeicoli) => {
    console.log('renderGriglia() chiamato con', datiVeicoli.length, 'veicoli');
    setVehicles(datiVeicoli);
  };
  
  const handleDelete = async (vehicleId) => {
    try {
      console.log('Eliminazione veicolo:', vehicleId);
      await vehiclesAPI.delete(vehicleId);
      console.log('Veicolo eliminato con successo');
    
      // Ricarica lista veicoli
      getListaVeicoli();
    } catch (err) {
      console.error('Errore eliminazione veicolo:', err);
      alert('Errore durante l\'eliminazione: ' + err.message);
    }
  };

  // Mostro spinner durante caricamento
  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Mostro errore se qualcosa va storto (uso Alert MUI default - no CSS)
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
  <Box>
    {/* Header con titolo */}
    <Box className="vehicle-grid-header">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" className="vehicle-grid-title">
          Flotta Veicoli ({filteredVehicles.length}{vehicles.length !== filteredVehicles.length ? ` di ${vehicles.length}` : ''})
        </Typography>

        {/* Box per Ricerca + Bottone Aggiungi */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Campo ricerca */}
          <TextField
            label="Cerca veicolo"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Targa, autista, numero..."
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* AGGIUNGI BOTTONE */}
          <Button
            variant="contained"
            onClick={() => {
              const targa = prompt('Targa:');
              const autista = prompt('Nome autista:');
              const numero = prompt('Numero autista:');
              
              if (targa && autista && numero) {
                vehiclesAPI.create({ targa, nomeAutista: autista, numeroAutista: numero })
                  .then(() => {
                    alert('Veicolo aggiunto!');
                    getListaVeicoli();
                  })
                  .catch(err => alert('Errore: ' + err.message));
              }
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            ➕ Aggiungi
          </Button>
        </Box>
      </Box>
    </Box>


     
      {/* Griglia veicoli - Zeimpekis pag. 162 suggerisce layout responsive */}
      <Grid container spacing={3} className="custom-grid-container">
        {filteredVehicles.map((vehicle) => (
          <Grid 
            key={vehicle._id}
            size={{ xs: 12, sm: 6, md: 4 }}
            className="custom-grid-item"
          >
            <VehicleCard 
            vehicle={vehicle}
            onDelete={handleDelete}
            />
          </Grid> 
        ))}
      </Grid> 
      
      {/* Messaggio se nessun veicolo */}
      {vehicles.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 3 }}>
          Nessun veicolo disponibile
        </Typography>
      )}
    </Box>
  );
}

export default VehicleGrid;

