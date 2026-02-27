const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AviVerse NFT - Nông nghiệp Thông minh API',
      version: '1.0.0',
      description: 'API quản lý toàn bộ vòng đời sản xuất nông nghiệp: Khu vực → Trang trại → Lô đất → Giống → Mùa vụ → Thu hoạch → Chế biến → Sản phẩm → Đơn hàng.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:4201',
        description: 'Development server',
      },
      {
        url: '/',
        description: 'Current server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token nhận được từ POST /api/auth/login hoặc /api/auth/register',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            fullName: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['FARMER', 'INVESTOR', 'ADMIN', 'DISTRIBUTOR', 'PROCESSOR'] },
            walletAddress: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string', description: 'JWT token' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'System', description: 'Hệ thống' },
      { name: 'Auth', description: 'Xác thực và đăng ký' },
      { name: 'Users', description: 'Quản lý người dùng (Admin)' },
      { name: 'Regions', description: 'Khu vực địa lý (Tỉnh/Huyện/Xã)' },
      { name: 'Farms', description: 'Trang trại' },
      { name: 'Plots', description: 'Lô đất' },
      { name: 'Seasons', description: 'Mùa vụ' },
      { name: 'Tasks', description: 'Nhiệm vụ chăm sóc' },
      { name: 'Crops', description: 'Danh mục cây trồng' },
      { name: 'Seeds', description: 'Giống cây trồng' },
      { name: 'Seed Orders', description: 'Đơn đặt mua hạt giống' },
      { name: 'Harvests', description: 'Thu hoạch' },
      { name: 'Processing', description: 'Chế biến' },
      { name: 'Products', description: 'Sản phẩm' },
      { name: 'Orders', description: 'Đơn hàng phân phối' },
      { name: 'Inventory', description: 'Kho hàng' },
      { name: 'Public', description: 'API công khai (không cần xác thực)' },
    ],
  },
  apis: ['./src/routes/*.js', './src/config/swaggerPaths.js'],
};

module.exports = swaggerJsdoc(options);
