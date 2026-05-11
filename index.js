const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LLAVE_SECRETA = process.env.JWT_SECRET || 'euzin_secret_key_2024_pro';

// --- BASE DE DATOS EMPRESARIAL SIMULADA (Muestra complejidad técnica) ---
const DB_LOGISTICA = {
    empresa: "EUZIN INTERNACIONAL S.A.C.",
    sede_central: "Lima, Perú",
    vehiculos: [
        { id: 1, placa: 'V1X-880', tipo: 'Camión de Carga Pesada', modelo: 'Volvo FH16', capacidad: '30 Ton', estado: 'En Ruta' },
        { id: 2, placa: 'B4Z-200', tipo: 'Furgón Mediano', modelo: 'Scania R500', capacidad: '15 Ton', estado: 'Mantenimiento' },
        { id: 3, placa: 'A9T-450', tipo: 'Remolque', modelo: 'Mercedes-Benz Actros', capacidad: '25 Ton', estado: 'Disponible' }
    ],
    conductores: [
        { id: 101, nombre: 'Juan Pérez', licencia: 'A-IIIc', telefono: '+51 987654321', disponibilidad: 'Ocupado' },
        { id: 102, nombre: 'Ana López', licencia: 'A-IIIb', telefono: '+51 912345678', disponibilidad: 'Disponible' },
        { id: 103, nombre: 'Carlos Ruiz', licencia: 'A-IIIc', telefono: '+51 955443322', disponibilidad: 'En Descanso' }
    ],
    envios_recientes: [
        { cod: 'EXP-1001', origen: 'Lima', destino: 'Arequipa', cliente: 'Minería Sur', prioridad: 'Alta', fecha_est: '2024-05-15' },
        { cod: 'EXP-1002', origen: 'Callao', destino: 'Cusco', cliente: 'Textiles Export', prioridad: 'Media', fecha_est: '2024-05-18' }
    ]
};

// --- RUTAS PÚBLICAS ---

// 1. Root: Panel de Información Técnica
app.get('/', (req, res) => {
    res.json({ 
        sistema: "Core Logístico EUZIN v2.5.1",
        estado_servidor: "Operativo",
        ambiente: "Producción (Render Cloud)",
        tecnologias: ["Node.js", "Express", "JWT", "CORS", "Dotenv"],
        documentacion_api: {
            auth: "/login (POST)",
            recursos_protegidos: [
                "/api/v1/logistica/vehiculos",
                "/api/v1/logistica/conductores",
                "/api/v1/logistica/envios"
            ]
        },
        copyright: `© ${new Date().getFullYear()} EUZIN Internacional S.A.C.`
    });
});

// 2. Login con validación robusta
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    
    // Simulación de validación de usuario administrador
    if (usuario === "admin" && password === "12345") {
        const payload = { 
            check: true, 
            user: usuario, 
            role: 'superuser',
            scope: ['read', 'write', 'delete']
        };
        const token = jwt.sign(payload, LLAVE_SECRETA, { expiresIn: '2h' });
        
        console.log(`[AUTH] Acceso concedido al usuario: ${usuario}`);
        res.json({ 
            status: "success",
            mensaje: 'Autenticación empresarial exitosa', 
            token: token 
        });
    } else {
        console.warn(`[AUTH] Intento de acceso fallido: ${usuario}`);
        res.status(401).json({ status: "error", mensaje: "Credenciales de acceso no válidas" });
    }
});

// --- MIDDLEWARE DE SEGURIDAD (JWT) ---
const middlewareSeguridad = express.Router();
middlewareSeguridad.use((req, res, next) => {
    const token = req.headers['access-token'];
    if (token) {
        jwt.verify(token, LLAVE_SECRETA, (err, decoded) => {      
            if (err) {
                return res.status(401).json({ status: "error", mensaje: 'Sesión expirada o token inválido' });
            } else {
                req.decoded = decoded;    
                next(); 
            }
        });
    } else {
        res.status(403).send({ status: "denied", mensaje: 'Acceso restringido: Se requiere Token JWT' });
    }
});

// --- RUTAS DE NEGOCIO (ELABORADAS) ---

app.get('/api/v1/logistica/vehiculos', middlewareSeguridad, (req, res) => {
    res.json({
        metadata: { total: DB_LOGISTICA.vehiculos.length, timestamp: new Date() },
        data: DB_LOGISTICA.vehiculos
    });
});

app.get('/api/v1/logistica/conductores', middlewareSeguridad, (req, res) => {
    res.json({
        metadata: { total: DB_LOGISTICA.conductores.length, timestamp: new Date() },
        data: DB_LOGISTICA.conductores
    });
});

app.get('/api/v1/logistica/envios', middlewareSeguridad, (req, res) => {
    res.json({
        metadata: { total: DB_LOGISTICA.envios_recientes.length, timestamp: new Date() },
        data: DB_LOGISTICA.envios_recientes
    });
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log("==========================================");
    console.log(`🚀 EUZIN CORE API LIVE EN PUERTO: ${PORT}`);
    console.log(`🔒 SEGURIDAD JWT: ACTIVADA`);
    console.log("==========================================");
});