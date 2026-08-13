import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LOOP Feedback Platform API',
      version: '1.0.0',
      description:
        'Production REST API for LOOP Feedback Platform featuring AI Sentiment Classification, Ask LOOP RAG Engine, VoC Executive Reporting, and Workspace Multi-Tenancy.',
      contact: {
        name: 'LOOP Engineering Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login or /api/auth/signup',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Bad Request' },
            message: { type: 'string', example: 'Invalid parameter provided' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr_123' },
            email: { type: 'string', example: 'admin@acme.com' },
            name: { type: 'string', example: 'Alice Admin' },
            role: { type: 'string', enum: ['ADMIN', 'ANALYST', 'VIEWER'], example: 'ADMIN' },
            workspaceId: { type: 'string', example: 'ws_acme' },
          },
        },
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'fb_123' },
            content: { type: 'string', example: 'The mobile dashboard load time is too slow.' },
            source: { type: 'string', example: 'Zendesk' },
            channel: { type: 'string', example: 'SUPPORT_TICKET' },
            sentiment: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'], example: 'NEGATIVE' },
            sentimentScore: { type: 'number', example: -0.75 },
            customerLabel: { type: 'string', example: 'Enterprise' },
            status: { type: 'string', enum: ['NEW', 'IN_REVIEW', 'RESOLVED', 'ARCHIVED'], example: 'NEW' },
            workspaceId: { type: 'string', example: 'ws_acme' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Theme: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'thm_1' },
            name: { type: 'string', example: 'Performance & Speed' },
            description: { type: 'string', example: 'Issues related to app loading time and speed.' },
            workspaceId: { type: 'string', example: 'ws_acme' },
          },
        },
        AskRequest: {
          type: 'object',
          required: ['question'],
          properties: {
            question: { type: 'string', example: 'What are enterprise users saying about dashboard performance?' },
          },
        },
        AskResponse: {
          type: 'object',
          properties: {
            answer: { type: 'string', example: 'Enterprise users report slow load times on mobile dashboards [fb_123].' },
            citedFeedbackIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['fb_123'],
            },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'rep_123' },
            title: { type: 'string', example: 'Voice of Customer Executive Report - Q3' },
            periodStart: { type: 'string', format: 'date-time' },
            periodEnd: { type: 'string', format: 'date-time' },
            summary: { type: 'string', example: 'Overall customer sentiment is positive with a surge in performance feedback.' },
            keyThemes: { type: 'array', items: { type: 'string' } },
            actionableInsights: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/api/auth/signup': {
        post: {
          summary: 'User Signup',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'name', 'workspaceName'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    name: { type: 'string' },
                    workspaceName: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User created successfully', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
            400: { description: 'User or workspace already exists' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'User Login',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/feedback': {
        get: {
          summary: 'Get Paginated & Filtered Feedback',
          tags: ['Feedback'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'sentiment', in: 'query', schema: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] } },
            { name: 'channel', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of feedback items' },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          summary: 'Submit Single Feedback',
          tags: ['Feedback'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content', 'source'],
                  properties: {
                    content: { type: 'string' },
                    source: { type: 'string' },
                    channel: { type: 'string' },
                    customerLabel: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Feedback created and AI classified' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/ask': {
        post: {
          summary: 'Ask LOOP Grounded Q&A',
          tags: ['AI Features'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AskRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Grounded answer with citations', content: { 'application/json': { schema: { $ref: '#/components/schemas/AskResponse' } } } },
            401: { description: 'Unauthorized' },
            429: { description: 'AI Rate limit exceeded' },
          },
        },
      },
      '/api/reports': {
        post: {
          summary: 'Generate Voice of Customer Report',
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string' },
                    periodStart: { type: 'string', format: 'date-time' },
                    periodEnd: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Report generated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Report' } } } },
            401: { description: 'Unauthorized' },
          },
        },
        get: {
          summary: 'List Generated Reports',
          tags: ['Reports'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of reports' },
          },
        },
      },
      '/api/analytics/overview': {
        get: {
          summary: 'Get Workspace Analytics KPI Overview',
          tags: ['Analytics'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'KPI Overview metrics (total feedback, sentiment ratios %, average sentiment score, active themes count)' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/analytics/sentiment-trend': {
        get: {
          summary: 'Get Historical Sentiment Time-Series Trend',
          tags: ['Analytics'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'days', in: 'query', schema: { type: 'integer', default: 30 } },
          ],
          responses: {
            200: { description: 'Daily aggregated feedback volume and average sentiment score' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/analytics/channels': {
        get: {
          summary: 'Get Sentiment Breakdown by Channel',
          tags: ['Analytics'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Volume and average sentiment breakdown grouped by channel' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  },
  apis: [], // All specs are defined cleanly in the definition above
};

export const swaggerSpec = swaggerJsdoc(options);
