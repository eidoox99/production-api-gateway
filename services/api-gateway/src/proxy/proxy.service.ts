import type { Request, RequestHandler, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  USER_ID_HEADER,
  USER_ROLE_HEADER,
} from "@production-grade-api-gateway/shared";
import type { RequestWithUser } from "../middlewares/auth.js";
import { getCircuitBreaker } from "./circuit-breaker-manager.js";
import type { UpstreamServiceName } from "./services.config.js";

interface ServiceRoutes {
  userServiceUrl: string;
  orderServiceUrl: string;
  paymentServiceUrl: string;
}

function resolveUpstreamService(path: string): UpstreamServiceName | null {
  if (path.startsWith("/users")) {
    return "user-service";
  }

  if (path.startsWith("/orders")) {
    return "order-service";
  }

  if (path.startsWith("/payments")) {
    return "payment-service";
  }

  return null;
}

function isServiceUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === "Circuit breaker is OPEN" ||
    error.message === "Circuit breaker HALF_OPEN request limit exceeded"
  );
}

function runProxy(
  req: Request,
  res: Response,
  proxy: RequestHandler
): Promise<void> {
  return new Promise((resolve, reject) => {
    const onFinish = () => {
      cleanup();
      resolve();
    };

    const onClose = () => {
      cleanup();

      if (!res.writableEnded) {
        reject(new Error("Response closed before finish"));
        return;
      }

      resolve();
    };

    const cleanup = () => {
      res.removeListener("finish", onFinish);
      res.removeListener("close", onClose);
    };

    res.once("finish", onFinish);
    res.once("close", onClose);

    proxy(req, res, (error) => {
      cleanup();

      if (error) {
        reject(error);
      }
    });
  });
}

export function createProxyService(routes: ServiceRoutes): RequestHandler {
  const proxy = createProxyMiddleware<Request>({
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

  return async (req, res, next) => {
    const path = req.url || "";
    const serviceName = resolveUpstreamService(path);

    if (!serviceName) {
      next();
      return;
    }

    const circuitBreaker = getCircuitBreaker(serviceName);

    if (circuitBreaker.getState() === "OPEN") {
      res.status(503).json({ error: "Service unavailable" });
      return;
    }

    try {
      await circuitBreaker.execute(() => runProxy(req, res, proxy));
    } catch (error) {
      if (isServiceUnavailableError(error)) {
        if (!res.headersSent) {
          res.status(503).json({ error: "Service unavailable" });
        }

        return;
      }

      next(error);
    }
  };
}
