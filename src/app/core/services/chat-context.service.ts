import { Injectable, Signal, signal } from '@angular/core';
import { ChatContext } from '../models/chat-context.model';

/**
 * Single source of truth for the current page context.
 *
 * Flow:
 *   Routed page components → set()
 *   ChatSidebarComponent   → get() / getSnapshot()
 *   Route transitions                 → clear()
 */
@Injectable({ providedIn: 'root' })
export class ChatContextService {
  private readonly contextSignal = signal<ChatContext | null>(null);

  /** Replace the current context. Called by page components. */
  set(ctx: ChatContext): void {
    this.contextSignal.set(ctx);
  }

  /** Reactive signal for components that read context directly. */
  get(): Signal<ChatContext | null> {
    return this.contextSignal.asReadonly();
  }

  /**
   * Synchronous snapshot — use when you need the current value once
   * (e.g. just before sending a chat request).
   */
  getSnapshot(): ChatContext | null {
    return this.contextSignal();
  }

  /** Reset when leaving authenticated area or when a route has no context. */
  clear(): void {
    this.contextSignal.set(null);
  }
}
