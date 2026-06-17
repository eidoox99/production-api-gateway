import { createCircuitBreaker } from "./circuit-breaker.js";
import {
  servicesCircuitBreakerConfig,
  type UpstreamServiceName,
} from "./services.config.js";
import type { CircuitBreaker } from "./circuit-breaker.types.js";

const circuitBreakers = new Map<UpstreamServiceName, CircuitBreaker>();

for (const serviceName of Object.keys(
  servicesCircuitBreakerConfig
) as UpstreamServiceName[]) {
  circuitBreakers.set(
    serviceName,
    createCircuitBreaker(servicesCircuitBreakerConfig[serviceName])
  );
}

export function getCircuitBreaker(
  serviceName: UpstreamServiceName
): CircuitBreaker {
  const circuitBreaker = circuitBreakers.get(serviceName);

  if (!circuitBreaker) {
    throw new Error(`Circuit breaker not found for service: ${serviceName}`);
  }

  return circuitBreaker;
}
