export interface CircuitBreakerConfig {
  timeout: number;
  failureThreshold: number;
  minimumRequests: number;
  cooldownPeriod: number;
  halfOpenMaxRequests: number;
}

export type UpstreamServiceName =
  | "user-service"
  | "order-service"
  | "payment-service";

export type ServicesCircuitBreakerConfig = Record<
  UpstreamServiceName,
  CircuitBreakerConfig
>;

export const servicesCircuitBreakerConfig = {
  "user-service": {
    timeout: 200,
    failureThreshold: 50,
    minimumRequests: 20,
    cooldownPeriod: 30,
    halfOpenMaxRequests: 3,
  },
  "order-service": {
    timeout: 300,
    failureThreshold: 60,
    minimumRequests: 30,
    cooldownPeriod: 60,
    halfOpenMaxRequests: 5,
  },
  "payment-service": {
    timeout: 500,
    failureThreshold: 30,
    minimumRequests: 10,
    cooldownPeriod: 120,
    halfOpenMaxRequests: 2,
  },
} as const satisfies ServicesCircuitBreakerConfig;
