const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const express = require('express');
const { startServer } = require('./startServer');

test('falls back to the next port when the requested port is busy', async () => {
  const occupiedServer = net.createServer();
  await new Promise((resolve) => occupiedServer.listen(0, '127.0.0.1', resolve));

  const { port } = occupiedServer.address();
  const app = express();

  let startedPort = null;
  let listeningServer = null;

  await new Promise((resolve, reject) => {
    startServer(app, {
      port,
      host: '127.0.0.1',
      onListening: (server, usedPort) => {
        listeningServer = server;
        startedPort = usedPort;
        resolve();
      },
      onError: reject
    });
  });

  assert.notEqual(startedPort, port);
  assert.ok(startedPort > port);

  await new Promise((resolve) => listeningServer.close(resolve));
  await new Promise((resolve) => occupiedServer.close(resolve));
});
