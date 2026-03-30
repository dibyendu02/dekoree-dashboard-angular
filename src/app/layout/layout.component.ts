import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ChatSidebarComponent } from './chat-sidebar/chat-sidebar.component';
import { ChatContextService } from '../core/services/chat-context.service';
import { ChatContext } from '../core/models/chat-context.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, NgClass, ChatSidebarComponent],
  template: `
    <div class="layout-root">

      <!-- ── Left navigation sidebar ─────────────────────── -->
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="sidebarCollapsed.update(v => !v)"
      />

      <!-- ── Main content column ────────────────────────── -->
      <div
        class="content-column"
        [ngClass]="sidebarCollapsed() ? 'ml-[76px]' : 'ml-[264px]'"
        [style.padding-right]="chatOpen() ? '360px' : '0'"
      >
        <app-topbar />
        <main class="flex-1 overflow-y-auto">
          <div class="page-container animate-fade-in">
            <router-outlet />
          </div>
        </main>
      </div>

      <!-- ── AI Chat sidebar (fixed, right) ─────────────── -->
      <app-chat-sidebar
        [isOpen]="chatOpen()"
        (closed)="chatOpen.set(false)"
      />

      <!-- ── Floating chat toggle button (hidden when sidebar is open) ── -->
      @if (!chatOpen()) {
        <button
          class="chat-fab"
          (click)="chatOpen.set(true)"
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
        >
          <span class="material-icons fab-icon">smart_toy</span>
          <span class="fab-label">AI</span>
        </button>
      }

    </div>
  `,
  styles: `
    .layout-root {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--color-surface-alt);
    }

    .content-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: padding-right 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                  margin-left 0.3s ease;
    }

    /* ── Floating Action Button ─────────────────────────────── */
    .chat-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 60;

      display: flex;
      align-items: center;
      gap: 6px;

      padding: 0 14px;
      height: 44px;

      border: none;
      border-radius: 22px;
      cursor: pointer;

      background: var(--color-primary);
      color: #fff;
      box-shadow: var(--shadow-lg);

      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      letter-spacing: 0.02em;

      transition: background 0.2s, transform 0.2s, box-shadow 0.2s;

      &:hover {
        background: var(--color-primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-xl);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .fab-icon {
      font-size: 19px;
    }

    .fab-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
  `,
})
export class LayoutComponent {
  // ── Nav sidebar state ────────────────────────────────────────
  readonly sidebarCollapsed = signal(false);

  // ── Chat sidebar state ───────────────────────────────────────
  readonly chatOpen = signal(false);

  // ── Services ─────────────────────────────────────────────────
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly chatContextService = inject(ChatContextService);

  constructor() {
    this.syncContextOnNavigation();
  }

  // ─────────────────────────────────────────────────────────────
  // Route → Context sync
  //
  // On every NavigationEnd we walk to the deepest activated child
  // route and read `data.chatContext` (set in app.routes.ts).
  // If a route uses a resolver instead, the resolved value lands
  // in the same `data` map — so this code handles both cases.
  // ─────────────────────────────────────────────────────────────

  private syncContextOnNavigation(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const ctx = this.extractDeepestChatContext();
        if (ctx) {
          console.log('[ChatContext] Route context →', ctx);
          this.chatContextService.setContext(ctx);
        } else {
          this.chatContextService.clear();
        }
      });
  }

  private extractDeepestChatContext(): ChatContext | null {
    let route = this.activatedRoute.firstChild;
    // Walk to the deepest activated child route.
    while (route?.firstChild) {
      route = route.firstChild;
    }
    return (route?.snapshot.data?.['chatContext'] as ChatContext) ?? null;
  }
}
