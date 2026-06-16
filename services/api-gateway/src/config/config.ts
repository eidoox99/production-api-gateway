export const config = {
  port: Number(process.env.PORT) || 3010,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:3001",
  orderServiceUrl: process.env.ORDER_SERVICE_URL || "http://localhost:3002",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || "http://localhost:3003",
};
