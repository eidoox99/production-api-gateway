import type {
  CircuitBreaker,
  CircuitBreakerConfig,
  CircuitBreakerMetrics,
  CircuitState,
} from "./circuit-breaker.types.js";

export function createCircuitBreaker(
  _config: CircuitBreakerConfig
): CircuitBreaker {
  let state: CircuitState = "CLOSED";
  let totalRequests = 0;
  let failedRequests = 0;
  let successfulRequests = 0;
  let openedAt: number | null = null;
  let halfOpenRequests = 0;

  async function execute<T>(_fn: () => Promise<T>): Promise<T> {
    return undefined as T;
  }

  function getState(): CircuitState {
    return state;
  }

  function getMetrics(): CircuitBreakerMetrics {
    return {
      totalRequests,
      failedRequests,
      successfulRequests,
      openedAt,
      halfOpenRequests,
    };
  }

  function reset(): void {
    state = "CLOSED";
    totalRequests = 0;
    failedRequests = 0;
    successfulRequests = 0;
    openedAt = null;
    halfOpenRequests = 0;
  }

  return {
    execute,
    getState,
    getMetrics,
    reset,
  };
}
