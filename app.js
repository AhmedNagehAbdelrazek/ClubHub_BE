const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const mainRoute = require('./Routes/index');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet());

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Serve the OpenAPI YAML spec
  app.get('/api-docs/swagger.yaml', (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.sendFile(path.join(__dirname, 'docs/openapi/base.yaml'), (err) => {
      if (err) {
        res.status(404).send('Swagger spec not found');
      }
    });
  });

  // Swagger UI setup pointing to the YAML endpoint
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerUrl: '/api-docs/swagger.yaml',
    })
  );

  // Versioned API routes
  app.use('/api/v1', mainRoute);

  app.get('/', (req, res) => {
    res.send('Hello to ClubHub Server');
  });

  app.use(globalErrorHandler);

  // Temporary route for route extraction (remove later)
  app.get('/__dump_routes', (req, res) => {
    const listEndpoints = require('express-list-endpoints');
    const endpoints = listEndpoints(app);
    res.json(endpoints);
  });
  return app;
}

module.exports = { createApp };
