require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const app = express();

//Domini autorizzati
const allowedOrigins = [
    'http://localhost:5173',   // Locale
    'https://drivedesk-wine.vercel.app'    //Vercel
];

//Creazione server HTTP e socket.io
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

//Associazione server HTTP e socket.io
app.set('socketio', io);

//Creazione socket per gestione connessioni
io.on('connection', socket => {
    console.log('Nuova connessione socket: ', socket.id);
    socket.on('disconnect', () => console.log('Disconnessione socket: ', socket.id));
});

//Middleware
app.use(express.json());
app.use(cors({
    origin: allowedOrigins
}));

//Connessione al database
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Database connesso')).catch(err => console.log(err));

//Rotta base
app.get('/', (req, res) => res.send('Server in esecuzione'));

//Rotte
app.use('/api/auth', require('./routes/auth')); //collegamento rotte auth
app.use('/api/veicoli', require('./routes/veicoli')); //collegamento rotte veicoli
app.use('/api/allarmi', require('./routes/allarmi')); //collegamento rotte allarmi
app.use('/api/telemetria', require('./routes/telemetria')); //collegamento rotte telemetria

//Avvio server real-time
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));
