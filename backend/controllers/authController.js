const Utente = require('../models/Utente');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Logica login
exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const utente = await Utente.findOne({email});
        if (!utente) return res.status(400).json({msg: 'Utente non trovato'});
        const isMatch = await bcrypt.compare(password, utente.password);  //confronto password
        if (!isMatch) return res.status(400).json({msg: 'Password errata'});
        const payload = {
            user: {
                id: utente.id,
                ruolo: utente.ruolo
            }
        };
        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 360000}, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: utente.id,
                    email: utente.email,
                    ruolo: utente.ruolo
                }
            });
        });
    } catch (errore) {
        console.error(errore);
        res.status(500).json({msg: 'Errore interno del server'});
    }
};
