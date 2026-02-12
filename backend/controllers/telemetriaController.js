const Veicolo = require('../models/Veicolo');
const Allarme = require('../models/Allarme');
const req = require("express/lib/request");

exports.postTelemetria = async (req, res) => {
    try {
        // Ricevo i dati
        const {targa, posizione, velocita, livelloCarburante, guasto} = req.body;
        //Trovo il veicolo
        const veicolo = await Veicolo.findOne({targa});
        if (!veicolo) return res.status(404).json({msg: 'Veicolo non trovato'});

        //Aggiorno i dati
        veicolo.posizione = posizione;
        veicolo.velocita = velocita;
        veicolo.livelloCarburante = livelloCarburante;
        veicolo.ultimoAggiornamento = Date.now();
        if (velocita > 0) {
            veicolo.stato = 'movimento';
        } else {
            veicolo.stato = 'sosta';
        }

        // Gestione guasto: se il sensore segnala un guasto
        if (guasto) {
            veicolo.stato = 'allarme';
            //Viene attivato l'allarme
            const nuovoAllarme = new Allarme({
                veicolo: veicolo._id,
                causa: guasto,
                categoria: 'medio',
                stato: 'nuovo',
                timestamp: Date.now()
            });
            await nuovoAllarme.save();

            //Notifica real-time
            const io = req.app.get('socketio');
            io.emit('nuovoAllarme', {
                targa: veicolo.targa,
                messaggio: guasto,
                idAllarme: nuovoAllarme._id
            });
            console.log(`Attenzione, allarme per il veicolo: ${targa}`);
        }

        //Salvo i dati aggiornati
        await veicolo.save();
        res.json({msg: 'Dati ricevuti', statoVeicolo: veicolo.stato});

    } catch (errore) {
        console.error(errore);
        res.status(500).json({msg: 'Errore interno del server'});
    }
};
