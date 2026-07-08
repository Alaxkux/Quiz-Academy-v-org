function startServer(app, { port = 3000, host = '0.0.0.0', onListening, onError } = {}) {
  const attemptListen = (currentPort) => {
    const server = app.listen(currentPort, host, () => {
      if (typeof onListening === 'function') {
        onListening(server, currentPort);
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = currentPort + 1;
        console.warn(`⚠️ Port ${currentPort} is busy. Trying ${nextPort}...`);
        server.close(() => attemptListen(nextPort));
        return;
      }

      if (typeof onError === 'function') {
        onError(err, currentPort);
        return;
      }

      console.error('❌ Failed to start server:', err.message);
      process.exit(1);
    });
  };

  attemptListen(port);
}

module.exports = { startServer };
