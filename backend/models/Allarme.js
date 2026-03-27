const mongoose = require('mongoose');
const allarmeSchema = new mongoose.Schema({
    veicolo: {type: mongoose.Schema.Types.ObjectId, ref: 'Veicolo', required: true},  //punta al veicolo associato all'allarme
    causa: {type: String, required: true},
    categoria: {type: String, enum: ['lieve', 'medio', 'grave'], default: 'medio'},
    stato: {type: String, enum: ['nuovo', 'gestione', 'risolto'], default: 'nuovo'},
    timestamp: { type: Date, default: Date.now}
});
module.exports = mongoose.model('Allarme', allarmeSchema);
