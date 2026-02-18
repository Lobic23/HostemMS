import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`ROOT : http://localhost:${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});