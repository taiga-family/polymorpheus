import {
    ChangeDetectionStrategy,
    Component,
    createEnvironmentInjector,
    EnvironmentInjector,
    inject,
    InjectionToken,
    input,
    type OnDestroy,
    signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {
    injectContext,
    PolymorpheusComponent,
    PolymorpheusOutlet,
} from '@taiga-ui/polymorpheus';

declare const ngDevMode: boolean;

interface Context {
    value: string;
}

const LABEL = new InjectionToken(ngDevMode ? '[LABEL]: label' : '', {
    factory: () => 'default',
});

describe('PolymorpheusOutlet', () => {
    let created = 0;
    let destroyed = 0;

    @Component({
        template: '{{ label }}: {{ context.value }} / {{ value() }}',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Content implements OnDestroy {
        public readonly context = injectContext<Context>();
        public readonly label = inject(LABEL);
        public readonly value = input('');

        constructor() {
            created++;
        }

        public ngOnDestroy(): void {
            destroyed++;
        }
    }

    @Component({
        imports: [PolymorpheusOutlet],
        template: '<ng-container *polymorpheusOutlet="content; context: context()" />',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Host {
        public content = new PolymorpheusComponent(Content);
        public readonly context = signal<Context>({value: 'first'});
    }

    it('checks the public component context type', () => {
        const accept = (
            context: PolymorpheusOutlet<unknown, Content>['context'],
        ): unknown => context;

        expect(accept({value: 'valid'})).toEqual({value: 'valid'});
        expect(accept(undefined)).toBeUndefined();

        // @ts-expect-error -- The public context requires a value.
        accept({});
        // @ts-expect-error -- The public context requires a string value.
        accept({value: 42});
        // @ts-expect-error -- Misspelled context properties are rejected.
        accept({values: 'invalid'});
    });

    it('keeps context unrestricted without a public context field', () => {
        class WithoutContext {}

        class ProtectedContext {
            protected readonly context: Context = {value: 'protected'};
        }

        const withoutContext: PolymorpheusOutlet<unknown, WithoutContext>['context'] = {
            other: 42,
        };

        const protectedContext: PolymorpheusOutlet<unknown, ProtectedContext>['context'] =
            {other: 42};

        expect(withoutContext).toEqual({other: 42});
        expect(protectedContext).toEqual({other: 42});
    });

    it('preserves the explicitly supplied context type', () => {
        const accept = (context: PolymorpheusOutlet<Context>['context']): unknown =>
            context;

        expect(accept({value: 'valid'})).toEqual({value: 'valid'});

        // @ts-expect-error -- The existing context generic still requires a string.
        accept({value: 42});
    });

    it('renders the injected context and synchronizes inputs', () => {
        const fixture = TestBed.createComponent(Host);

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('default: first / first');
    });

    it('updates context and inputs without recreating the component', () => {
        const fixture = TestBed.createComponent(Host);

        fixture.detectChanges();

        const count = created;

        fixture.componentInstance.context.set({value: 'second'});
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('default: second / second');
        expect(created).toBe(count);
    });

    it('destroys the component with its outlet', () => {
        const fixture = TestBed.createComponent(Host);

        fixture.detectChanges();

        const count = destroyed;

        fixture.destroy();

        expect(destroyed).toBe(count + 1);
    });

    it('preserves the custom injector of the existing component wrapper', () => {
        const fixture = TestBed.createComponent(Host);
        const injector = createEnvironmentInjector(
            [{provide: LABEL, useValue: 'custom'}],
            TestBed.inject(EnvironmentInjector),
        );

        fixture.componentInstance.content = new PolymorpheusComponent(Content, injector);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toBe('custom: first / first');

        fixture.destroy();
        injector.destroy();
    });
});
