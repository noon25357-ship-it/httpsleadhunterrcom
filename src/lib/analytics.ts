export function trackEvent(event: string, data?: Record<string, unknown>) {
  console.log(`[LeadHunter Analytics] ${event}`, data || "");
  // Future: send to analytics service
}
