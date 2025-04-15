import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OnTrip API',
      version: '1.0.0',
      description: 'API documentation for the OnTrip application',
      contact: {
        name: 'API Support',
        email: 'support@ontrip.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    // Use absolute paths to ensure files are found correctly
    path.resolve(__dirname, './modules/**/*.ts'),
    path.resolve(__dirname, './modules/**/infras/transport/*.ts'),
    // Explicitly include the swagger documentation files
    path.resolve(__dirname, './modules/user/infras/transport/swagger.ts'),
    path.resolve(__dirname, './modules/friends/infras/transport/swagger.ts'),
    path.resolve(__dirname, './modules/groups/infras/transport/index.ts')
  ],
  // Enable Swagger to find and parse TypeScript files
  failOnErrors: true, // Throw exception if Swagger validation fails
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
