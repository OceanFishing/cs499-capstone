import { InjectionToken } from '@angular/core';

/* Injection token wrapping localStorage for use across Angular components */
export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
    providedIn: 'root',
    factory: () => localStorage
});

export class Storage { }