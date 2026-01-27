

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assets');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const ownershipRoutes = require('./routes/ownerships');
const ownershipUsageRoutes = require('./routes/ownershipUsage');
const bookingRoutes = require('./routes/bookings');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ownerships', ownershipRoutes);
app.use('/api/ownership-usage', ownershipUsageRoutes);
app.use('/api/bookings', bookingRoutes);

// === Health Check or Fallback ===
app.get('/', (req, res) => {
    res.send('EliteFraction API is running');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
