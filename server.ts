// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocket } from './lib/socket'; // Importer notre initialiseur

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname });
const handle = app.getRequestHandler();

// Function to find an available port
const findAvailablePort = async (startPort: number): Promise<number> => {
  const net = require('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialiser Socket.IO en utilisant notre fonction
  initSocket(httpServer);

  // Try to find an available port
  findAvailablePort(port).then(availablePort => {
    httpServer
      .listen(availablePort, () => {
        console.log(`> Server ready on http://${hostname}:${availablePort}`);
        console.log('> Socket.IO server initialized');
      })
      .on('error', (err) => {
        console.error('Server error:', err);
        process.exit(1);
      });
  }).catch(err => {
    console.error('Failed to find an available port:', err);
    process.exit(1);
  });
});