import {
    Injectable,
    Injector,
    Type,
    inject,
    ApplicationRef,
    createComponent,
    EnvironmentInjector,
    signal,
} from '@angular/core';
import { Subject, Observable, take } from 'rxjs';

export interface DialogConfig {
    width?: string;
    maxHeight?: string;
    data?: unknown;
}

export interface DialogRef<R = unknown> {
    close(result?: R): void;
    afterClosed(): Observable<R | undefined>;
}

// Token for injecting dialog data and ref
export const DIALOG_DATA = Symbol('DIALOG_DATA');
export const DIALOG_REF = Symbol('DIALOG_REF');

@Injectable({ providedIn: 'root' })
export class DialogService {
    private readonly appRef = inject(ApplicationRef);
    private readonly envInjector = inject(EnvironmentInjector);

    open<T, R = unknown>(
        component: Type<T>,
        config?: DialogConfig
    ): DialogRef<R> {
        const afterClosed$ = new Subject<R | undefined>();

        const dialogRef: DialogRef<R> = {
            close: (result?: R) => {
                afterClosed$.next(result);
                afterClosed$.complete();
                // Destroy the dialog
                setTimeout(() => {
                    backdrop.remove();
                    dialogHost.remove();
                    componentRef.destroy();
                });
            },
            afterClosed: () => afterClosed$.pipe(take(1)),
        };

        // Create injector with dialog data and ref
        const injector = Injector.create({
            providers: [
                { provide: 'DIALOG_DATA', useValue: config?.data },
                { provide: 'DIALOG_REF', useValue: dialogRef },
            ],
            parent: this.envInjector,
        });

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className =
            'fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-fast';
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                dialogRef.close(undefined);
            }
        });

        // Create dialog container
        const dialogHost = document.createElement('div');
        dialogHost.className = 'dialog-panel animate-scale-in';
        dialogHost.style.width = config?.width ?? '500px';
        dialogHost.style.maxWidth = '95vw';
        dialogHost.style.maxHeight = config?.maxHeight ?? '90vh';

        backdrop.appendChild(dialogHost);
        document.body.appendChild(backdrop);

        // Create component
        const componentRef = createComponent(component, {
            hostElement: dialogHost,
            environmentInjector: this.envInjector,
            elementInjector: injector,
        });

        this.appRef.attachView(componentRef.hostView);

        return dialogRef;
    }
}
