import { Component, output, input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <span
        class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-lg"
        style="color: var(--color-text-muted)"
      >
        search
      </span>
      <input
        type="text"
        [placeholder]="placeholder()"
        [(ngModel)]="searchValue"
        (ngModelChange)="onInput($event)"
        class="filter-select w-full !pl-10 !pr-9 !bg-none"
        style="
          background-color: var(--color-surface);
          background-image: none;
        "
      />
      @if (searchValue) {
        <button
          class="absolute right-3 top-1/2 -translate-y-1/2"
          style="color: var(--color-text-muted)"
          (click)="clear()"
        >
          <span class="material-icons text-base">close</span>
        </button>
      }
    </div>
  `,
})
export class SearchInputComponent implements OnInit, OnDestroy {
  readonly placeholder = input('Search...');
  readonly debounce = input(300);
  readonly searchChange = output<string>();

  searchValue = '';
  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(this.debounce()), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(value => this.searchChange.emit(value));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(value: string): void {
    this.search$.next(value);
  }

  clear(): void {
    this.searchValue = '';
    this.searchChange.emit('');
  }
}
