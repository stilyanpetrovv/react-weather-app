import { Hono } from 'hono';
import { serve } from '@hono/node-server'; // Node.js-specific server runner

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello from Hono!');
});

// Start the server
serve({
  fetch: app.fetch, // This is required to serve the Hono app
  port: 3000,       // Port where the server will run
});

console.log('Server is running on http://localhost:3000');
