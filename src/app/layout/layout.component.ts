import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ChatSidebarComponent } from './chat-sidebar/chat-sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, NgClass, ChatSidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  // ── Nav sidebar state ────────────────────────────────────────
  readonly sidebarCollapsed = signal(false);

  // ── Chat sidebar state ───────────────────────────────────────
  readonly chatOpen = signal(false);

}
