import type { Request, RequestHandler } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  USER_ID_HEADER,
  USER_ROLE_HEADER,
} from "@production-grade-api-gateway/shared";
import type { RequestWithUser } from "../middlewares/auth.js";

interface ServiceRoutes {
  userServiceUrl: string;
  orderServiceUrl: string;
  paymentServiceUrl: string;
}

export function createGatewayProxy(routes: ServiceRoutes): RequestHandler {
  return createProxyMiddleware<Request>({
    changeOrigin: true,
    pathFilter: (path) =>
      path.startsWith("/users") ||
      path.startsWith("/orders") ||
      path.startsWith("/payments"),
    router: (req) => {
      const path = req.url || "";

      if (path.startsWith("/users")) {
        return routes.userServiceUrl;
      }

      if (path.startsWith("/orders")) {
        return routes.orderServiceUrl;
      }

      if (path.startsWith("/payments")) {
        return routes.paymentServiceUrl;
      }

      return routes.userServiceUrl;
    },
    on: {
      proxyReq: (proxyReq, req) => {
        const user = (req as RequestWithUser).user;

        if (user) {
          proxyReq.setHeader(USER_ID_HEADER, user.userId);
          proxyReq.setHeader(USER_ROLE_HEADER, user.userRole);
        }
      },
    },
  });
}
