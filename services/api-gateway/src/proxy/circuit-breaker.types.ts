export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  timeout: number;
  failureThreshold: number;
  minimumRequests: number;
  cooldownPeriod: number;
  halfOpenMaxRequests: number;
}

export interface CircuitBreakerMetrics {
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
  openedAt: number | null;
  halfOpenRequests: number;
}

export interface CircuitBreaker {
  execute<T>(fn: () => Promise<T>): Promise<T>;
  getState(): CircuitState;
  getMetrics(): CircuitBreakerMetrics;
  reset(): void;
}
