/// <reference types="@taiga-ui/tsconfig/ng-dev-mode" />
import {inject, InjectionToken, type InjectOptions, type Provider} from '@angular/core';

/**
 * Use this token to access context within your components when
 * instantiating them through {@link PolymorpheusOutlet}
 */
export const POLYMORPHEUS_CONTEXT = new InjectionToken<Record<any, any>>(
    ngDevMode ? 'POLYMORPHEUS_CONTEXT' : '',
);

export function provideContext<T = Record<any, any>>(useValue: T): Provider {
    return {
        provide: POLYMORPHEUS_CONTEXT,
        useValue,
    };
}

export function injectContext<T>(options?: InjectOptions & {optional?: false}): T;
export function injectContext<T>(options?: InjectOptions & {optional: true}): T | null;
export function injectContext<T>(options: InjectOptions = {}): T | null {
    return inject(POLYMORPHEUS_CONTEXT, options);
}
