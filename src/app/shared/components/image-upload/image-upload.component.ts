import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  template: `
    <div
      class="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
             hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
      style="border-color: var(--color-border)"
      (click)="fileInput.click()"
      (dragover)="onDragOver($event)"
      (drop)="onDrop($event)"
    >
      <input
        #fileInput
        type="file"
        [accept]="accept()"
        [multiple]="multiple()"
        class="hidden"
        (change)="onFileChange($event)"
      />

      @if (previews().length === 0) {
        <span class="material-icons text-4xl mb-2" style="color: var(--color-text-muted)">
          cloud_upload
        </span>
        <p class="text-sm font-medium" style="color: var(--color-text-secondary)">
          Click or drag files to upload
        </p>
        <p class="text-xs mt-1" style="color: var(--color-text-muted)">
          {{ hint() }}
        </p>
      } @else {
        <div class="flex flex-wrap gap-3 justify-center">
          @for (preview of previews(); track $index) {
            <div class="relative group">
              <img
                [src]="preview"
                class="w-24 h-24 object-cover rounded-lg border"
                style="border-color: var(--color-border)"
              />
              <button
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                       flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                (click)="removeImage($index, $event)"
              >
                <span class="material-icons text-sm">close</span>
              </button>
            </div>
          }
        </div>
        <p class="text-xs mt-3" style="color: var(--color-text-muted)">
          Click to add more
        </p>
      }
    </div>
  `,
})
export class ImageUploadComponent {
  readonly accept = input('image/*');
  readonly multiple = input(false);
  readonly maxSize = input(10);
  readonly hint = input('Max 10MB per file');

  readonly filesChange = output<File[]>();
  readonly previews = signal<string[]>([]);

  private files: File[] = [];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(Array.from(files));
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
      input.value = '';
    }
  }

  removeImage(index: number, event: Event): void {
    event.stopPropagation();
    this.files.splice(index, 1);
    this.previews.update(p => p.filter((_, i) => i !== index));
    this.filesChange.emit([...this.files]);
  }

  private handleFiles(newFiles: File[]): void {
    const maxBytes = this.maxSize() * 1024 * 1024;
    const validFiles = newFiles.filter(f => f.size <= maxBytes);

    if (this.multiple()) {
      this.files.push(...validFiles);
    } else {
      this.files = validFiles.slice(0, 1);
      this.previews.set([]);
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.previews.update(p =>
          this.multiple() ? [...p, reader.result as string] : [reader.result as string]
        );
      };
      reader.readAsDataURL(file);
    });

    this.filesChange.emit([...this.files]);
  }
}
