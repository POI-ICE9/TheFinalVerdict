require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const { connectRedis } = require('./config/redis');
const { initWebSocket } = require('./config/websocket');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connetti database
    await sequelize.authenticate();
    logger.info('✅ Database connected');

    // Sync models (in produzione usare migrations)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Models synced');
    }

    // Connetti Redis
    await connectRedis();

    // Crea server HTTP
    const server = http.createServer(app);

    // Inizializza WebSocket
    initWebSocket(server);

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();