const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Talent Management API',
            version: '1.0.0',
            description: 'API for managing Resume & User related crud operations',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
    },
    apis: ['./controllers/*.js'],
}

const specs = swaggerJsdoc(options);

module.exports = specs;