import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from '@jest/globals';
import {PolymorpheusOutlet, PolymorpheusTemplate} from '@taiga-ui/polymorpheus';

describe('PolymorpheusTemplate', () => {
    @Component({
        standalone: true,
        imports: [PolymorpheusOutlet, PolymorpheusTemplate],
        template: `
            <ng-container *polymorpheusOutlet="polymorpheus; context: context" />
            <ng-template
                #polymorpheus="polymorpheus"
                let-value
                [polymorpheus]="type"
            >
                {{ value.name }}
            </ng-template>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestComponent {
        protected context: {$implicit: {name: string}; sum: number} = {
            $implicit: {name: 'Alex'},
            sum: 237,
        };

        protected type!: {$implicit: {name: number}};
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestComponent],
            teardown: {destroyAfterEach: false},
        }).compileComponents();
    });

    it('template typing works', () => {
        const fixture = TestBed.createComponent(TestComponent);

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent.trim()).toBe('Alex');
    });
});
