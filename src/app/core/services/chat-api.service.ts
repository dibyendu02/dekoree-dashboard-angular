import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ChatContext, ChatRequest, ChatResponse } from '../models/chat-context.model';

/**
 * Thin HTTP wrapper for the RAG chat endpoint.
 *
 * Sends: { query, context } — keeps payload minimal by relying on
 *   the metadata field rather than large rawData blobs.
 *
 * Falls back to a mock response when the API is unreachable (mirrors
 *   the pattern used by ApiService elsewhere in this project).
 */
@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly http = inject(HttpClient);
  private readonly chatEndpoint = `${environment.apiUrl}/chat`;

  send(query: string, context: ChatContext | null): Observable<ChatResponse> {
    const payload: ChatRequest = { query, context };

    return this.http
      .post<ChatResponse>(this.chatEndpoint, payload)
      .pipe(catchError(() => this.mockResponse(query, context)));
  }

  // ------------------------------------------------------------------
  // Mock — replaces real API during development / when API is down.
  // Remove or gate behind environment.production === false if desired.
  // ------------------------------------------------------------------

  private mockResponse(
    query: string,
    context: ChatContext | null,
  ): Observable<ChatResponse> {
    const page = context?.page ?? 'this page';
    const templates = [
      `Based on the **${page}** context, here's what I found for "${query}": the data looks healthy with normal trends. You can dig deeper by filtering by date range or category.`,
      `Great question about "${query}"! On the **${page}** page I can see relevant metrics. Would you like me to summarise the key numbers or highlight any anomalies?`,
      `Regarding "${query}" — looking at the **${page}** data, everything appears within expected ranges. Let me know if you want a breakdown by a specific dimension.`,
    ];
    const message = templates[Math.floor(Math.random() * templates.length)];
    // Simulate realistic network latency (1–2 s)
    return of({ message }).pipe(delay(1000 + Math.random() * 800));
  }
}
