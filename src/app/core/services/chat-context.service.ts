import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatContext } from '../models/chat-context.model';

/**
 * Single source of truth for the current page context.
 *
 * Flow:
 *   Route resolvers / LayoutComponent → setContext()
 *   ChatSidebarComponent              → getContext() / getSnapshot()
 *   Route transitions                 → clear()
 */
@Injectable({ providedIn: 'root' })
export class ChatContextService {
  private readonly _context$ = new BehaviorSubject<ChatContext | null>(null);

  /** Replace the current context.  Called by LayoutComponent on NavigationEnd. */
  setContext(ctx: ChatContext): void {
    this._context$.next(ctx);
  }

  /** Observable stream — subscribe in components that react to context changes. */
  getContext(): Observable<ChatContext | null> {
    return this._context$.asObservable();
  }

  /**
   * Synchronous snapshot — use when you need the current value once
   * (e.g. just before sending a chat request).
   */
  getSnapshot(): ChatContext | null {
    return this._context$.getValue();
  }

  /** Reset when leaving authenticated area or when a route has no context. */
  clear(): void {
    this._context$.next(null);
  }
}
