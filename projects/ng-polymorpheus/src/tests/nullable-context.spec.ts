import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {
    injectContext,
    PolymorpheusComponent,
    PolymorpheusOutlet,
    provideContext,
} from '@taiga-ui/polymorpheus';

interface Context {
    readonly value: string;
}

@Component({
    template: '{{ context.value }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class ComponentContent {
    public readonly context = injectContext<Context>();
}

@Component({
    imports: [PolymorpheusOutlet],
    template: '<ng-container *polymorpheusOutlet="content; context: context" />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideContext<Context>({value: 'Inherited context'})],
})
class TestComponent {
    public readonly content = new PolymorpheusComponent(ComponentContent);
    public context: Context | null = null;
}

describe('PolymorpheusOutlet with nullable context', () => {
    it.each<[Context | null, string]>([
        [null, 'Inherited context'],
        [{value: 'Explicit context'}, 'Explicit context'],
    ])('renders with %p as context', async (context, expected) => {
        await TestBed.configureTestingModule({
            imports: [TestComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(TestComponent);

        fixture.componentInstance.context = context;
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent.trim()).toBe(expected);
    });
});
