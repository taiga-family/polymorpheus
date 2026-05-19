import {CommonModule, NgIf} from '@angular/common';
import type {OnDestroy, TemplateRef} from '@angular/core';
import {ChangeDetectionStrategy, Component, ElementRef, ViewChild} from '@angular/core';
import type {ComponentFixture} from '@angular/core/testing';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import type {PolymorpheusContent} from '@taiga-ui/polymorpheus';
import {
    injectContext,
    PolymorpheusComponent,
    PolymorpheusOutlet,
    PolymorpheusTemplate,
} from '@taiga-ui/polymorpheus';

let COUNTER = 0;
const destroyedContexts: unknown[] = [];

describe('PolymorpheusOutlet', () => {
    @Component({
        standalone: true,
        imports: [NgIf, PolymorpheusOutlet, PolymorpheusTemplate],
        template: `
            <div
                *ngIf="polymorphic; else basic"
                #element
            >
                <ng-container
                    *polymorpheusOutlet="content as primitive; context: context"
                >
                    <div *ngIf="isNumber(primitive); else str">
                        Number: {{ primitive }}
                    </div>
                    <ng-template #str>String: {{ primitive }}</ng-template>
                </ng-container>
            </div>
            <ng-template #basic>
                <div #element>
                    <ng-container
                        *polymorpheusOutlet="content as primitive; context: context"
                    >
                        {{ primitive }}
                    </ng-container>
                </div>
            </ng-template>
            <ng-template
                #plain
                let-value
            >
                <strong>{{ value }}</strong>
            </ng-template>
            <ng-template
                #polymorpheus="polymorpheus"
                let-value
                polymorpheus
            >
                <strong>{{ value }}</strong>
            </ng-template>
        `,
        // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
        changeDetection: ChangeDetectionStrategy.Default,
    })
    class TestComponent {
        @ViewChild('element', {read: ElementRef})
        public element!: ElementRef<HTMLElement>;

        @ViewChild('plain')
        public template!: TemplateRef<Record<never, never>>;

        @ViewChild('polymorpheus')
        public polymorpheus!: PolymorpheusTemplate<Record<never, never>>;

        public polymorphic = false;

        public content: PolymorpheusContent = '';

        public context: any = undefined;

        public isNumber(primitive: number | string): boolean {
            return typeof primitive === 'number';
        }
    }

    @Component({
        standalone: true,
        template: `
            Component: {{ context.$implicit }}
        `,
        // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
        changeDetection: ChangeDetectionStrategy.Default,
    })
    class ComponentContent {
        public readonly context = injectContext();

        constructor() {
            COUNTER++;
        }
    }

    @Component({
        standalone: true,
        template: '{{ value }}',
        inputs: ['value'],
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class WithInputs {
        public value = '';
    }

    @Component({
        standalone: true,
        template: '',
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class DestroyableContent implements OnDestroy {
        public readonly context = injectContext<any>();

        public ngOnDestroy(): void {
            destroyedContexts.push(this.context.$implicit);
        }
    }

    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;

    function text(): string {
        return fixture.nativeElement.textContent?.trim() ?? '';
    }

    function html(): string {
        return fixture.nativeElement.innerHTML;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ComponentContent,
                TestComponent,
                CommonModule,
                PolymorpheusOutlet,
                PolymorpheusTemplate,
            ],
            teardown: {destroyAfterEach: false},
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('empty by default', () => {
        expect(text()).toBe('');
    });

    it('static type check exists', () => {
        // @ts-ignore
        expect(PolymorpheusTemplate.ngTemplateContextGuard({polymorpheus: {}})).toBe(
            true,
        );
    });

    it('directive static type check exists', () => {
        // @ts-ignore
        expect(PolymorpheusOutlet.ngTemplateContextGuard({polymorpheus: {}})).toBe(true);
    });

    describe('Primitive', () => {
        it('works with strings', () => {
            testComponent.content = 'string';
            fixture.detectChanges();

            expect(text()).toBe('string');
        });

        it('works with numbers', () => {
            testComponent.content = 237;
            fixture.detectChanges();

            expect(text()).toBe('237');
        });
    });

    describe('Handler', () => {
        beforeEach(() => {
            testComponent.context = {
                $implicit: 'string',
            };
            testComponent.content = ({$implicit}) => $implicit;
            fixture.detectChanges();
        });

        it('works with strings', () => {
            expect(text()).toBe('string');
        });

        it('works with numbers', () => {
            testComponent.context = {
                $implicit: 237,
            };
            fixture.detectChanges();

            expect(text()).toBe('237');
        });
    });

    describe('Polymorphic', () => {
        beforeEach(() => {
            testComponent.polymorphic = true;
            fixture.detectChanges();
        });

        describe('Primitive', () => {
            it('works with strings', () => {
                testComponent.content = 'string';
                fixture.detectChanges();

                expect(text()).toBe('String: string');
            });

            it('works with numbers', () => {
                testComponent.content = 237;
                fixture.detectChanges();

                expect(text()).toBe('Number: 237');
            });
        });

        describe('Handler', () => {
            beforeEach(() => {
                testComponent.context = {
                    $implicit: 'string',
                };
                testComponent.content = ({$implicit}) => $implicit;
                fixture.detectChanges();
            });

            it('works with strings', () => {
                expect(text()).toBe('String: string');
            });

            it('works with numbers', () => {
                testComponent.context = {
                    $implicit: 237,
                };
                fixture.detectChanges();

                expect(text()).toBe('Number: 237');
            });
        });
    });

    it('templateRef', () => {
        testComponent.context = {
            $implicit: 'string',
        };
        testComponent.content = testComponent.template;
        fixture.detectChanges();

        expect(html()).toContain('<strong>string</strong>');
    });

    describe('PolymorpheusTemplate', () => {
        beforeEach(() => {
            testComponent.context = {
                $implicit: 'string',
            };
            testComponent.content = testComponent.polymorpheus;
        });

        it('works', () => {
            fixture.detectChanges();

            expect(html()).toContain('<strong>string</strong>');
        });

        it('triggers change detection', () => {
            const changeDetectionSpy = jest.spyOn(testComponent.polymorpheus, 'check');

            fixture.detectChanges();

            expect(changeDetectionSpy).toHaveBeenCalled();
        });
    });

    describe('PolymorpheusComponent', () => {
        it('creates component', () => {
            testComponent.context = {
                $implicit: 'string',
            };
            testComponent.content = new PolymorpheusComponent(ComponentContent);
            fixture.detectChanges();

            expect(text()).toBe('Component: string');
        });

        it('does not recreate component if context changes to the same shape', () => {
            testComponent.context = {
                $implicit: 'string',
            };
            testComponent.content = new PolymorpheusComponent(ComponentContent);
            fixture.detectChanges();

            const counter = COUNTER;

            testComponent.context = {
                $implicit: 'number',
            };
            fixture.detectChanges();

            expect(text()).toBe('Component: number');
            expect(COUNTER).toBe(counter);
        });

        it('create a non-object context', () => {
            testComponent.context = 'Hello World';
            testComponent.content = new PolymorpheusComponent(ComponentContent);
            fixture.detectChanges();

            expect(text()).toBe('Component: Hello World');
        });
    });

    describe('Inputs', () => {
        it('are processed initially when available', () => {
            testComponent.context = {$implicit: 'string', value: 'Hello World'};
            testComponent.content = new PolymorpheusComponent(WithInputs);
            fixture.detectChanges();

            expect(text()).toBe('Hello World');
        });

        it('updated when context changes', () => {
            testComponent.context = {$implicit: 'string', value: 'Hello World'};
            testComponent.content = new PolymorpheusComponent(WithInputs);
            fixture.detectChanges();

            testComponent.context = {$implicit: 'string', value: 'New value'};
            fixture.detectChanges();

            expect(text()).toBe('New value');
        });
    });

    describe('DestroyableContent', () => {
        beforeEach(() => {
            destroyedContexts.length = 0;
        });

        it.each([null, '', 0])(
            'keeps context in ngOnDestroy when switching from component to %p',
            (content) => {
                testComponent.context = {$implicit: 'string'};
                testComponent.content = new PolymorpheusComponent(DestroyableContent);
                fixture.detectChanges();

                testComponent.content = content;
                fixture.detectChanges();

                expect(destroyedContexts).toEqual(['string']);
            },
        );

        it.each([
            [0, 'Number: 0'],
            ['', 'String:'],
        ])('does not treat %p as missing content', (content, expected) => {
            testComponent.polymorphic = true;
            testComponent.context = {$implicit: 'fallback'};
            testComponent.content = content;
            fixture.detectChanges();

            expect(text()).toBe(expected);
        });
    });
});
