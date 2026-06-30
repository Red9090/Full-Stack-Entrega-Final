const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const productRoutes = require('./routes/product.routes');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas públicas
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ecommerce API is running' });
});

// Rutas de productos
app.use('/api/products', productRoutes);

// Manejo de errores global
app.use(errorHandler);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
