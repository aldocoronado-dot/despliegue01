const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const LLAVE_SECRETA = process.env.JWT_SECRET || 'mi_llave_ultra_secreta_123';
app.get('/', (req, res) => {
    res.json({ mensaje: "Bienvenido a la API con JWT - Laboratorio de Despliegue" });
});
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === "admin" && password === "12345") {
        const payload = { 
            check: true,
            user: usuario,
            role: 'admin'
        };
                const token = jwt.sign(payload, LLAVE_SECRETA, {
            expiresIn: 7200
        });
        res.json({
            mensaje: '¡Autenticación exitosa!',
            token: token
        });
    } else {
        res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
    }
});
const verificacion = express.Router();
verificacion.use((req, res, next) => {
    const token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, LLAVE_SECRETA, (err, decoded) => {      
            if (err) {
                return res.status(401).json({ mensaje: 'Token inválida o expirada' });    
            } else {
                req.decoded = decoded;    
                next(); 
            }
        });
    } else {
        res.status(403).send({ mensaje: 'Acceso denegado: No se proporcionó un token.' });
    }
});
app.get('/datos', verificacion, (req, res) => {
    res.json({ 
        mensaje: "Acceso concedido",
        data: "Este es el contenido protegido que solo un usuario autenticado puede ver.",
        usuario: req.decoded.user
    });
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`Presiona Ctrl+C para detener el servidor`);
});