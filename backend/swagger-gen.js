const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'School Platform API',
    description: 'API documentation for the school platform backend',
  },
  host: 'localhost:5000',
  schemes: ['http'],
};

const outputFile = './src/docs/swagger_output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc);
