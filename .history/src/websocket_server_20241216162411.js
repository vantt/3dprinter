// server.js
const WebSocket = require('ws');
const http = require('http');

// Create HTTP server to serve a simple status page
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Simulate printer status
let printerStatus = {
  status: 'idle',
  temperature: 25,
  progress: 0
};

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send initial status
  ws.send(JSON.stringify({ type: 'status', data: printerStatus }));

  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      switch (data.type) {
        case 'command':
          // Simulate command processing
          console.log('Processing command:', data.command);
          ws.send(JSON.stringify({
            type: 'response',
            data: { message: `Processed command: ${data.command}` }
          }));
          break;

        case 'getStatus':
          ws.send(JSON.stringify({ type: 'status', data: printerStatus }));
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Simulate printer status updates
setInterval(() => {
  printerStatus.temperature = 25 + Math.random() * 5;
  const statusMessage = JSON.stringify({ type: 'status', data: printerStatus });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(statusMessage);
    }
  });
}, 2000);

const PORT = 8989;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Your local IP addresses:`);
  require('os').networkInterfaces()['en0']?.forEach(interface => {
    if (interface.family === 'IPv4') {
      console.log(`http://${interface.address}:${PORT}`);
    }
  });
});