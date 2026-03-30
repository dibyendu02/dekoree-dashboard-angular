import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import { ChatContextService } from '../../core/services/chat-context.service';
import { ChatApiService } from '../../core/services/chat-api.service';
import { ChatMessage } from '../../core/models/chat-context.model';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss',
})
export class ChatSidebarComponent implements OnChanges {
  // ── Inputs / Outputs ────────────────────────────────────────────

  @Input() isOpen = false;
  @Output() readonly closed = new EventEmitter<void>();

  // Bind the `open` CSS class directly on the host element so the
  // slide-in animation is driven purely by CSS (no JS style mutations).
  @HostBinding('class.open') get openClass(): boolean {
    return this.isOpen;
  }

  // ── Template refs ───────────────────────────────────────────────

  @ViewChild('messageList') private readonly messageListRef!: ElementRef<HTMLElement>;
  @ViewChild('inputField') private readonly inputFieldRef!: ElementRef<HTMLTextAreaElement>;

  // ── Services ────────────────────────────────────────────────────

  private readonly chatContextService = inject(ChatContextService);
  private readonly chatApiService = inject(ChatApiService);

  // ── State ───────────────────────────────────────────────────────

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);

  /** Reactive snapshot of the current page context. */
  readonly context = toSignal(this.chatContextService.getContext(), {
    initialValue: null,
  });

  inputText = '';

  // ── Lifecycle ───────────────────────────────────────────────────

  ngOnChanges(): void {
    // Auto-focus the textarea when the panel opens.
    if (this.isOpen) {
      setTimeout(() => this.inputFieldRef?.nativeElement.focus(), 300);
    }
  }

  // ── Public actions ──────────────────────────────────────────────

  sendMessage(): void {
    const query = this.inputText.trim();
    if (!query || this.loading()) return;

    this.appendMessage('user', query);
    this.inputText = '';
    this.loading.set(true);
    this.scrollToBottom();

    this.chatApiService
      .send(query, this.chatContextService.getSnapshot())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.appendMessage('assistant', res.message);
          this.scrollToBottom();
        },
        error: () => {
          this.appendMessage(
            'assistant',
            'Sorry, I ran into an error. Please try again.',
          );
          this.scrollToBottom();
        },
      });
  }

  /** Sends on Enter; allows Shift+Enter for newlines. */
  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages.set([]);
  }

  close(): void {
    this.closed.emit();
  }

  get contextLabel(): string {
    const ctx = this.context();
    if (!ctx) return '';
    return ctx.breadcrumbs?.join(' › ') ?? ctx.page;
  }

  // ── Helpers ─────────────────────────────────────────────────────

  private appendMessage(role: 'user' | 'assistant', content: string): void {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    };
    this.messages.update((list) => [...list, msg]);
  }

  private scrollToBottom(): void {
    // Defer one tick so the new message node is in the DOM first.
    setTimeout(() => {
      const el = this.messageListRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}
