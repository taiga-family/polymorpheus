/* eslint-disable @angular-eslint/prefer-inject */
import {ChangeDetectorRef, Directive, inject, TemplateRef} from '@angular/core';

/**
 * ng-template wrapper directive also stores {@link ChangeDetectorRef} to properly handle change detection.
 */
@Directive({
    selector: 'ng-template[polymorpheus]',
    inputs: ['polymorpheus'],
    exportAs: 'polymorpheus',
})
export class PolymorpheusTemplate<C = any> {
    public polymorpheus: C | '' = '';

    constructor(
        public readonly template: TemplateRef<C> = inject(TemplateRef<C>, {self: true}),
        private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef),
    ) {}

    public static ngTemplateContextGuard<T>(
        _dir: PolymorpheusTemplate<T>,
        _ctx: any,
    ): _ctx is T extends '' ? any : T {
        return true;
    }

    public check(): void {
        this.cdr.markForCheck();
    }
}
