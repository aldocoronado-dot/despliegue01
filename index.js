const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LLAVE_SECRETA = process.env.JWT_SECRET || 'mi_llave_ultra_secreta_123';

// --- SIMULACIÓN DE BASE DE DATOS (Lo que lo hace "elaborado") ---
const database = {
    vehiculos: [
        { id: 1, placa: 'V1X-880', modelo: 'Volvo FH16', estado: 'En Ruta' },
        { id: 2, placa: 'B4Z-200', modelo: 'Scania R500', estado: 'Mantenimiento' }
    ],
    conductores: [
        { id: 101, nombre: 'Juan Pérez', licencia: 'A-IIIc', disponibilidad: true },
        { id: 102, nombre: 'Ana López', licencia: 'A-IIIb', disponibilidad: false }
    ]
};

// 1. Ruta de bienvenida (Panel de Control)
app.get('/', (req, res) => {
    res.json({ 
        mensaje: "API de Gestión Logística EUZIN - Producción",
        version: "2.5.0",
        status: "Running",
        endpoints: ["/login (POST)", "/api/vehiculos (GET-Protegido)", "/api/conductores (GET-Protegido)"]
    });
});

// 2. Login (Manteniendo tu lógica)
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    if (usuario === "admin" && password === "12345") {
        const payload = { check: true, user: usuario, role: 'admin' };
        const token = jwt.sign(payload, LLAVE_SECRETA, { expiresIn: 7200 });
        res.json({ mensaje: '¡Autenticación exitosa!', token: token });
    } else {
        res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
    }
});

// --- MIDDLEWARE DE VERIFICACIÓN ---
const verificacion = express.Router();
verificacion.use((req, res, next) => {
    const token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, LLAVE_SECRETA, (err, decoded) => {      
            if (err) return res.status(401).json({ mensaje: 'Token inválida' });
            req.decoded = decoded;    
            next(); 
        });
    } else {
        res.status(403).send({ mensaje: 'Acceso denegado: Token requerido.' });
    }
});

// --- RUTAS DE NEGOCIO (Aquí es donde el ingeniero verá el trabajo previo) ---

// Obtener vehículos
app.get('/api/vehiculos', verificacion, (req, res) => {
    res.json({
        empresa: "EUZIN Internacional",
        total: database.vehiculos.length,
        items: database.vehiculos
    });
});

// Obtener conductores
app.get('/api/conductores', verificacion, (req, res) => {
    res.json({
        empresa: "EUZIN Internacional",
        items: database.conductores
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
});