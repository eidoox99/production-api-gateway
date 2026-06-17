import express from "express";
import cors from "cors";
import helmet from "helmet";
import { signToken, createError } from "@production-grade-api-gateway/shared";
import { config } from "./config/config.js";
import { createAuthMiddleware } from "./middlewares/auth.js";
import { createProxyService } from "./proxy/proxy.service.js";

const app = express();
const authMiddleware = createAuthMiddleware(config.jwtSecret);

app.use(helmet());
app.use(cors());

app.post("/auth/login", express.json(), (req, res, next) => {
  const { userId, userRole } = req.body;

  if (!userId || !userRole) {
    return next(createError(400, "userId and userRole are required"));
  }

  const token = signToken({ userId, userRole }, config.jwtSecret);
  res.json({ token });
});

app.use(
  authMiddleware,
  createProxyService({
    userServiceUrl: config.userServiceUrl,
    orderServiceUrl: config.orderServiceUrl,
    paymentServiceUrl: config.paymentServiceUrl,
  })
);

app.use(
  (
    err: { status?: number; message: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message });
  }
);

app.listen(config.port, () => {
  console.log(`api-gateway is running on port ${config.port}`);
});
