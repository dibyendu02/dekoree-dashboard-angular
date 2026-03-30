// ─── Chat Context ──────────────────────────────────────────────
// Strongly-typed contract shared between every route, the sidebar,
// and the backend RAG system.  Keep it lightweight — prefer
// metadata over rawData so the payload stays small.

export interface ChatContext {
  /** Identifies which page/section the user is on (e.g. 'dashboard', 'orders') */
  page: string;
  /** Optional entity being viewed (e.g. an order id or product id) */
  entityId?: string;
  /** Lightweight key/value pairs describing the current page state */
  metadata?: Record<string, unknown>;
  /** Permission slugs available to the current user on this page */
  permissions?: string[];
  /** Human-readable breadcrumb trail shown to the AI for context */
  breadcrumbs?: string[];
  /**
   * Escape hatch for raw structured data. Use sparingly —
   * the backend trims this to avoid bloated payloads.
   */
  rawData?: unknown;
}

// ─── Chat Messages ─────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

// ─── API Contract ──────────────────────────────────────────────

export interface ChatRequest {
  query: string;
  context: ChatContext | null;
}

export interface ChatResponse {
  message: string;
}
