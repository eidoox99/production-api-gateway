import type {
  CircuitBreaker,
  CircuitBreakerConfig,
  CircuitBreakerMetrics,
  CircuitState,
} from "./circuit-breaker.types.js";

export function createCircuitBreaker(
  config: CircuitBreakerConfig
): CircuitBreaker {
  let state: CircuitState = "CLOSED";
  let totalRequests = 0;
  let failedRequests = 0;
  let successfulRequests = 0;
  let openedAt: number | null = null;
  let halfOpenRequests = 0;

  function shouldOpenFromClosed(): boolean {
    if (totalRequests < config.minimumRequests) {
      return false;
    }

    const failureRate = (failedRequests / totalRequests) * 100;
    return failureRate >= config.failureThreshold;
  }

  function tryTransitionOpenToHalfOpen(): void {
    if (state !== "OPEN" || openedAt === null) {
      return;
    }

    const cooldownMs = config.cooldownPeriod * 1000;

    if (Date.now() - openedAt >= cooldownMs) {
      state = "HALF_OPEN";
      halfOpenRequests = 0;
    }
  }

  function transitionToOpen(): void {
    state = "OPEN";
    openedAt = Date.now();
    halfOpenRequests = 0;
  }

  function transitionToClosed(): void {
    state = "CLOSED";
    totalRequests = 0;
    failedRequests = 0;
    successfulRequests = 0;
    openedAt = null;
    halfOpenRequests = 0;
  }

  function onSuccess(): void {
    successfulRequests++;

    if (state === "HALF_OPEN") {
      transitionToClosed();
    }
  }

  function onFailure(): void {
    failedRequests++;

    if (state === "HALF_OPEN") {
      transitionToOpen();
      return;
    }

    if (state === "CLOSED" && shouldOpenFromClosed()) {
      transitionToOpen();
    }
  }

  function runWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Circuit breaker timeout"));
      }, config.timeout);
    });

    return Promise.race([fn(), timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }

  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    tryTransitionOpenToHalfOpen();

    if (state === "OPEN") {
      throw new Error("Circuit breaker is OPEN");
    }

    if (state === "HALF_OPEN") {
      if (halfOpenRequests >= config.halfOpenMaxRequests) {
        transitionToOpen();
        throw new Error("Circuit breaker HALF_OPEN request limit exceeded");
      }

      halfOpenRequests++;
    }

    totalRequests++;

    try {
      const result = await runWithTimeout(fn);
      onSuccess();
      return result;
    } catch (error) {
      onFailure();
      throw error;
    }
  }

  function getState(): CircuitState {
    tryTransitionOpenToHalfOpen();
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
    transitionToClosed();
  }

  return {
    execute,
    getState,
    getMetrics,
    reset,
  };
}
