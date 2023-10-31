const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Talent Management API",
      version: "1.0.0",
      description: "API for managing Resume & User related crud operations",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/controllers/userController.ts",
    "./src/controllers/tenantController.ts",
    "./src/controllers/*.ts"
  ],
};

const specs = swaggerJsdoc(options);

export default specs;
