/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Kiểm tra API hoạt động
 *     security: []
 *     responses:
 *       200:
 *         description: API đang chạy
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản mới
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               fullName: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [FARMER, INVESTOR, ADMIN, DISTRIBUTOR, PROCESSOR] }
 *               walletAddress: { type: string }
 *     responses:
 *       201: { description: Đăng ký thành công, content: { application/json: { schema: { $ref: '#/components/schemas/AuthResponse' } } } }
 *       400: { description: Thiếu thông tin hoặc email đã tồn tại }
 */
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Đăng nhập thành công }
 *       401: { description: Sai email hoặc mật khẩu }
 */
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy thông tin user đang đăng nhập
 *     responses:
 *       200: { description: Thông tin user }
 *       401: { description: Chưa đăng nhập }
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Danh sách người dùng (Admin only)
 *     responses:
 *       200: { description: Danh sách users }
 */
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Chi tiết user
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     tags: [Users]
 *     summary: Cập nhật user
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   delete:
 *     tags: [Users]
 *     summary: Xóa user
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */

/**
 * @swagger
 * /api/regions:
 *   get:
 *     tags: [Regions]
 *     summary: Danh sách khu vực
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [PROVINCE, DISTRICT, COMMUNE] }
 *   post:
 *     tags: [Regions]
 *     summary: Tạo khu vực mới (Admin only)
 */
/**
 * @swagger
 * /api/regions/{id}:
 *   get:
 *     tags: [Regions]
 *     summary: Chi tiết khu vực
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     tags: [Regions]
 *     summary: Cập nhật khu vực (Admin only)
 *   delete:
 *     tags: [Regions]
 *     summary: Xóa khu vực (Admin only)
 */

/**
 * @swagger
 * /api/farms:
 *   get:
 *     tags: [Farms]
 *     summary: Danh sách trang trại
 *     parameters:
 *       - in: query
 *         name: ownerId
 *         schema: { type: string }
 *       - in: query
 *         name: regionId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, ACTIVE, SUSPENDED, CLOSED] }
 *   post:
 *     tags: [Farms]
 *     summary: Tạo trang trại (Farmer/Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, regionId, address, latitude, longitude]
 *             properties:
 *               name: { type: string }
 *               regionId: { type: string }
 *               address: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               totalArea: { type: number }
 *               description: { type: string }
 *               certification: { type: array, items: { type: string } }
 *               status: { type: string, enum: [PENDING, ACTIVE, SUSPENDED, CLOSED] }
 */
/**
 * @swagger
 * /api/farms/{id}:
 *   get:
 *     tags: [Farms]
 *     summary: Chi tiết trang trại
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     tags: [Farms]
 *     summary: Cập nhật trang trại
 *   delete:
 *     tags: [Farms]
 *     summary: Xóa trang trại
 */

/**
 * @swagger
 * /api/plots:
 *   get:
 *     tags: [Plots]
 *     summary: Danh sách lô đất
 *     parameters:
 *       - in: query
 *         name: farmId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, FALLOW, HARVESTED, CLOSED] }
 *   post:
 *     tags: [Plots]
 *     summary: Tạo lô đất (Farmer/Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [farmId, geometry]
 *             properties:
 *               farmId: { type: string }
 *               geometry: { type: object, description: GeoJSON Polygon }
 *               name: { type: string }
 *               cropType: { type: string }
 *               soilType: { type: string }
 *               waterSource: { type: string }
 */
/**
 * @swagger
 * /api/plots/{id}:
 *   get:
 *     tags: [Plots]
 *     summary: Chi tiết lô đất
 *   put:
 *     tags: [Plots]
 *     summary: Cập nhật lô đất
 *   delete:
 *     tags: [Plots]
 *     summary: Xóa lô đất
 */

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     tags: [Seasons]
 *     summary: Danh sách mùa vụ
 *     parameters:
 *       - in: query
 *         name: plotId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PLANNED, PLANTED, GROWING, HARVESTING, HARVESTED, COMPLETED] }
 *   post:
 *     tags: [Seasons]
 *     summary: Tạo mùa vụ (Farmer/Admin)
 */
/**
 * @swagger
 * /api/seasons/{id}:
 *   get:
 *     tags: [Seasons]
 *     summary: Chi tiết mùa vụ
 *   put:
 *     tags: [Seasons]
 *     summary: Cập nhật mùa vụ
 *   delete:
 *     tags: [Seasons]
 *     summary: Xóa mùa vụ
 */
/**
 * @swagger
 * /api/seasons/{id}/growth-progress:
 *   get:
 *     tags: [Seasons]
 *     summary: Tiến độ sinh trưởng mùa vụ
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Danh sách nhiệm vụ
 *     parameters:
 *       - in: query
 *         name: plotId
 *         schema: { type: string }
 *       - in: query
 *         name: seasonId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED] }
 *   post:
 *     tags: [Tasks]
 *     summary: Tạo nhiệm vụ (Farmer/Admin)
 */
/**
 * @swagger
 * /api/tasks/suggest:
 *   post:
 *     tags: [Tasks]
 *     summary: Gợi ý nhiệm vụ (Farmer/Admin)
 */
/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Chi tiết nhiệm vụ
 *   put:
 *     tags: [Tasks]
 *     summary: Cập nhật nhiệm vụ
 *   delete:
 *     tags: [Tasks]
 *     summary: Xóa nhiệm vụ
 */

/**
 * @swagger
 * /api/crops:
 *   get:
 *     tags: [Crops]
 *     summary: Danh mục cây trồng
 *   post:
 *     tags: [Crops]
 *     summary: Tạo cây trồng (Admin only)
 */
/**
 * @swagger
 * /api/crops/{id}:
 *   get:
 *     tags: [Crops]
 *     summary: Chi tiết cây trồng
 *   put:
 *     tags: [Crops]
 *     summary: Cập nhật cây trồng (Admin only)
 *   delete:
 *     tags: [Crops]
 *     summary: Xóa cây trồng (Admin only)
 */

/**
 * @swagger
 * /api/seeds:
 *   get:
 *     tags: [Seeds]
 *     summary: Danh mục giống cây trồng
 *     parameters:
 *       - in: query
 *         name: cropId
 *         schema: { type: string }
 *   post:
 *     tags: [Seeds]
 *     summary: Tạo giống mới (Admin only)
 */
/**
 * @swagger
 * /api/seeds/{id}:
 *   get:
 *     tags: [Seeds]
 *     summary: Chi tiết giống
 *   put:
 *     tags: [Seeds]
 *     summary: Cập nhật giống (Admin only)
 *   delete:
 *     tags: [Seeds]
 *     summary: Xóa giống (Admin only)
 */

/**
 * @swagger
 * /api/seed-orders:
 *   get:
 *     tags: [Seed Orders]
 *     summary: Danh sách đơn mua hạt giống
 *     parameters:
 *       - in: query
 *         name: farmerId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED] }
 *   post:
 *     tags: [Seed Orders]
 *     summary: Tạo đơn mua hạt giống (Farmer/Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shippingAddress]
 *             properties:
 *               items: { type: array, items: { type: object, properties: { seedVarietyId: { type: string }, quantity: { type: number } } } }
 *               shippingAddress: { type: string }
 *               notes: { type: string }
 */
/**
 * @swagger
 * /api/seed-orders/{id}:
 *   get:
 *     tags: [Seed Orders]
 *     summary: Chi tiết đơn mua hạt giống
 */
/**
 * @swagger
 * /api/seed-orders/{id}/status:
 *   put:
 *     tags: [Seed Orders]
 *     summary: Cập nhật trạng thái đơn hạt giống
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED] }
 */

/**
 * @swagger
 * /api/harvests:
 *   get:
 *     tags: [Harvests]
 *     summary: Danh sách thu hoạch
 *     parameters:
 *       - in: query
 *         name: plotId
 *         schema: { type: string }
 *       - in: query
 *         name: seasonId
 *         schema: { type: string }
 *   post:
 *     tags: [Harvests]
 *     summary: Ghi nhận thu hoạch (Farmer/Admin)
 */
/**
 * @swagger
 * /api/harvests/export:
 *   get:
 *     tags: [Harvests]
 *     summary: Xuất danh sách thu hoạch
 */
/**
 * @swagger
 * /api/harvests/{id}:
 *   get:
 *     tags: [Harvests]
 *     summary: Chi tiết thu hoạch
 *   put:
 *     tags: [Harvests]
 *     summary: Cập nhật thu hoạch
 */

/**
 * @swagger
 * /api/processing:
 *   get:
 *     tags: [Processing]
 *     summary: Danh sách lô chế biến
 *   post:
 *     tags: [Processing]
 *     summary: Tạo lô chế biến (Processor/Admin)
 */
/**
 * @swagger
 * /api/processing/{id}:
 *   get:
 *     tags: [Processing]
 *     summary: Chi tiết lô chế biến
 *   put:
 *     tags: [Processing]
 *     summary: Cập nhật lô chế biến
 */
/**
 * @swagger
 * /api/processing/{id}/complete:
 *   post:
 *     tags: [Processing]
 *     summary: Hoàn thành lô chế biến
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Danh sách sản phẩm
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *   post:
 *     tags: [Products]
 *     summary: Tạo sản phẩm (Admin/Processor)
 */
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Chi tiết sản phẩm
 *   put:
 *     tags: [Products]
 *     summary: Cập nhật sản phẩm
 *   delete:
 *     tags: [Products]
 *     summary: Xóa sản phẩm (Admin only)
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Danh sách đơn hàng
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED] }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string, enum: [PENDING, PAID, FAILED, REFUNDED] }
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn hàng phân phối
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, customerName, customerPhone, shippingAddress]
 *             properties:
 *               items: { type: array, items: { type: object, properties: { productId: { type: string }, quantity: { type: number } } } }
 *               customerName: { type: string }
 *               customerEmail: { type: string }
 *               customerPhone: { type: string }
 *               shippingAddress: { type: string }
 *               billingAddress: { type: string }
 *               paymentMethod: { type: string }
 *               shippingMethod: { type: string }
 *               notes: { type: string }
 */
/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Chi tiết đơn hàng
 */
/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Cập nhật trạng thái đơn hàng (Admin/Distributor)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *               trackingNumber: { type: string }
 */
/**
 * @swagger
 * /api/orders/{id}/payment:
 *   put:
 *     tags: [Orders]
 *     summary: Cập nhật trạng thái thanh toán (Admin only)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus: { type: string, enum: [PENDING, PAID, FAILED, REFUNDED] }
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Danh sách kho
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [AVAILABLE, RESERVED, SHIPPED, SOLD, EXPIRED, DAMAGED] }
 *   post:
 *     tags: [Inventory]
 *     summary: Tạo mục kho (Admin/Processor)
 */
/**
 * @swagger
 * /api/inventory/summary:
 *   get:
 *     tags: [Inventory]
 *     summary: Tổng quan kho
 */
/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     tags: [Inventory]
 *     summary: Chi tiết mục kho
 *   put:
 *     tags: [Inventory]
 *     summary: Cập nhật mục kho (Admin only)
 *   delete:
 *     tags: [Inventory]
 *     summary: Xóa mục kho (Admin only)
 */

/**
 * @swagger
 * /api/public/plots:
 *   get:
 *     tags: [Public]
 *     summary: Lấy danh sách lô đất công khai (Landing page)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 6 }
 *     responses:
 *       200: { description: Danh sách lô đất với thông tin farm, humidity, growth }
 */
/**
 * @swagger
 * /api/public/stats:
 *   get:
 *     tags: [Public]
 *     summary: Thống kê công khai (Landing page)
 *     security: []
 *     responses:
 *       200: { description: plotsCount, harvestsCount, ordersCount, farmsCount, activeSeasonsCount, productsCount, totalRevenue, harvestHistory }
 */
/**
 * @swagger
 * /api/public/featured-farms:
 *   get:
 *     tags: [Public]
 *     summary: Trang trại nổi bật (Landing page)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 6 }
 *     responses:
 *       200: { description: Danh sách trang trại active kèm region, plotsCount }
 */
/**
 * @swagger
 * /api/public/products:
 *   get:
 *     tags: [Public]
 *     summary: Sản phẩm công khai (Landing page)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 8 }
 *     responses:
 *       200: { description: Danh sách sản phẩm isActive (name, price, category, certifications...) }
 */
/**
 * @swagger
 * /api/public/regions-summary:
 *   get:
 *     tags: [Public]
 *     summary: Tổng quan khu vực – tỉnh có trang trại (Landing page)
 *     security: []
 *     responses:
 *       200: { description: provincesCount, provinces[] (id, name, code, farmsCount) }
 */
