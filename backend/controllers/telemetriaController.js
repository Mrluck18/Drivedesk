const Veicolo = require('../models/Veicolo');
const Allarme = require('../models/Allarme');

exports.postTelemetria = async (req, res) => {
    try {
        // Ricevo i dati
        const {targa, posizione, velocita, livelloCarburante, guasto, categoria} = req.body;
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
                categoria: categoria,
                stato: 'nuovo',
                timestamp: Date.now()
            });
            await nuovoAllarme.save();

            //Notifica real-time
            const io = req.app.get('socketio');
            io.emit('nuovoAllarme', {
                targa: veicolo.targa,
                messaggio: guasto,
                idAllarme: nuovoAllarme._id,
                categoria: categoria || 'medio'
            });
            console.log(`Attenzione, allarme per il veicolo: ${targa}`);
        }

        //Implementazione Webhook per inviare, in caso di guasto, una notifica ai manager tramite API di telegram
        try {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;
            const telegramUrl = 'https://api.telegram.org/bot' + botToken + '/sendMessage'
            //Messaggio da mandare:
            const messaggioTelegram = '!!ALLARME Drivedesk!! Intervieni al più presto! \nVeicolo:' + targa + '\nCausa:' + guasto;
            //Utilizzo fetch per inviare la chiamata POST al server di telegram
            await fetch(telegramUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: messaggioTelegram
                })
            });
            console.log('Messaggio inviato a Telegram per il veicolo ${targa} con causa ${guasto}');
        } catch (error) {
            console.error('Errore durante invio del messaggio a Telegram:', error);
        }


        //Salvo i dati aggiornati
        await veicolo.save();
        res.json({msg: 'Dati ricevuti', statoVeicolo: veicolo.stato});

    } catch (errore) {
        console.error(errore);
        res.status(500).json({msg: 'Errore interno del server'});
    }
};
