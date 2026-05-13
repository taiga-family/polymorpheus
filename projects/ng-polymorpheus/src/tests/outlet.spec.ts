import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    type TemplateRef,
    viewChild,
} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {
    injectContext,
    PolymorpheusComponent,
    type PolymorpheusContent,
    PolymorpheusOutlet,
    PolymorpheusTemplate,
    provideContext,
} from '@taiga-ui/polymorpheus';
import {PolymorpheusContext} from "../classes/context";

let COUNTER = 0;

describe('PolymorpheusOutlet', () => {
    @Component({
        imports: [PolymorpheusOutlet, PolymorpheusTemplate],
        template: `
            @if (polymorphic) {
                <div #element>
                    <ng-container
                        *polymorpheusOutlet="content as primitive; context: context"
                    >
                        @if (isNumber(primitive)) {
                            <div>Number: {{ primitive }}</div>
                        } @else {
                            String: {{ primitive }}
                        }
                    </ng-container>
                </div>
            } @else {
                <div #element>
                    <ng-container
                        *polymorpheusOutlet="content as primitive; context: context"
                    >
                        {{ primitive }}
                    </ng-container>
                </div>
            }

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
        public readonly element = viewChild.required('element', {
            read: ElementRef<HTMLElement>,
        });

        public readonly template =
            viewChild.required<TemplateRef<Record<never, never>>>('plain');

        public readonly polymorpheus =
            viewChild.required<PolymorpheusTemplate<Record<never, never>>>(
                'polymorpheus',
            );

        public polymorphic = false;
        public content: PolymorpheusContent = '';
        public context: any = undefined;

        public isNumber(primitive: number | string): boolean {
            return typeof primitive === 'number';
        }
    }

    @Component({
        template: 'Component: {{ context.$implicit }}',
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
        template: '{{ value }}',
        inputs: ['value'],
        changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class WithInputs {
        public value = '';
    }

    @Component({
        template: 'Component:{{ context.$implicit }}',
        changeDetection: ChangeDetectionStrategy.Default,
    })
    class JustInjectContextComponent {
        public readonly context = injectContext<PolymorpheusContext<boolean>>();
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
            testComponent.context = {$implicit: 'string'};
            testComponent.content = ({$implicit}) => $implicit;
            fixture.detectChanges();
        });

        it('works with strings', () => {
            expect(text()).toBe('string');
        });

        it('works with numbers', () => {
            testComponent.context = {$implicit: 237};
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
                testComponent.context = {$implicit: 'string'};
                testComponent.content = ({$implicit}) => $implicit;
                fixture.detectChanges();
            });

            it('works with strings', () => {
                expect(text()).toBe('String: string');
            });

            it('works with numbers', () => {
                testComponent.context = {$implicit: 237};
                fixture.detectChanges();

                expect(text()).toBe('Number: 237');
            });
        });
    });

    it('templateRef', () => {
        testComponent.context = {$implicit: 'string'};
        testComponent.content = testComponent.template();
        fixture.detectChanges();

        expect(html()).toContain('<strong>string</strong>');
    });

    describe('PolymorpheusTemplate', () => {
        beforeEach(() => {
            testComponent.context = {$implicit: 'string'};
            testComponent.content = testComponent.polymorpheus()!;
        });

        it('works', () => {
            fixture.detectChanges();

            expect(html()).toContain('<strong>string</strong>');
        });

        it('triggers change detection', () => {
            const polymorpheus = testComponent.polymorpheus();
            const changeDetectionSpy = jest.spyOn(polymorpheus, 'check');

            fixture.detectChanges();

            expect(changeDetectionSpy).toHaveBeenCalled();
        });
    });

    describe('PolymorpheusComponent', () => {
        it('creates component', () => {
            testComponent.context = {$implicit: 'string'};
            testComponent.content = new PolymorpheusComponent(ComponentContent);
            fixture.detectChanges();

            expect(text()).toBe('Component: string');
        });

        it('does not recreate component if context changes to the same shape', () => {
            testComponent.context = {$implicit: 'string'};
            testComponent.content = new PolymorpheusComponent(ComponentContent);
            fixture.detectChanges();

            const counter = COUNTER;

            testComponent.context = {$implicit: 'number'};
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

    describe('Falsy primitive context values for component content', () => {
        it.each([
            [false, 'false'],
            [0, '0'],
            ['', ''],
            [null, ''],
        ])('provides %p through injectContext', (context, expected) => {
            testComponent.context = context;
            testComponent.content = new PolymorpheusComponent(JustInjectContextComponent);
            fixture.detectChanges();

            expect(text()).toBe(`Component:${expected}`);
        });
    });

    it('throws NullInjectorError when context input is not provided and parent has no context', () => {
        testComponent.context = undefined;
        testComponent.content = new PolymorpheusComponent(JustInjectContextComponent);

        expect(() => fixture.detectChanges()).toThrow();
    });

    it('does not shadow parent context when context input is not provided', () => {
        @Component({
            imports: [PolymorpheusOutlet],
            template: `
                <ng-container *polymorpheusOutlet="content" />
            `,
            changeDetection: ChangeDetectionStrategy.Default,
            providers: [provideContext({$implicit: 'parent'})],
        })
        class WithoutContextInput {
            public content = new PolymorpheusComponent(ComponentContent);
        }

        const fallbackFixture = TestBed.createComponent(WithoutContextInput);

        fallbackFixture.detectChanges();

        expect(fallbackFixture.nativeElement.textContent.trim()).toBe(
            'Component: parent',
        );
    });

    it('updates proxy shape when context keys change', () => {
        @Component({
            template: '{{ keys }}',
            changeDetection: ChangeDetectionStrategy.Default,
        })
        class ContextShapeComponent {
            public readonly context = injectContext<any>();

            public get keys(): string {
                return Object.keys(this.context).sort().join(',');
            }
        }

        testComponent.context = {
            $implicit: {name: 'Ivan', age: 5},
            loading: true,
        };

        testComponent.content = new PolymorpheusComponent(ContextShapeComponent);

        fixture.detectChanges();

        expect(text()).toBe('$implicit,loading');

        testComponent.context = {
            $implicit: {label: 'Igor', id: 3},
            error: false,
        };

        fixture.detectChanges();

        expect(text()).toBe('$implicit,error');
    });

    it('updates proxy shape when context changes from null to object', () => {
        @Component({
            template: '{{ keys }}',
            changeDetection: ChangeDetectionStrategy.Default,
        })
        class ContextShapeComponent {
            public readonly context = injectContext<any>();

            public get keys(): string {
                return Object.keys(this.context).sort().join(',');
            }
        }

        testComponent.context = null;
        testComponent.content = new PolymorpheusComponent(ContextShapeComponent);

        fixture.detectChanges();

        expect(text()).toBe('$implicit');

        testComponent.context = {
            $implicit: 'value',
            loading: true,
        };

        fixture.detectChanges();

        expect(text()).toBe('$implicit,loading');
    });
    it('keeps primitive context object behavior', () => {
        @Component({
            template: '{{ isContext }}:{{ hasImplicit }}:{{ keys }}:{{ spread }}:{{ json }}',
            changeDetection: ChangeDetectionStrategy.Default,
        })
        class ContextShapeComponent {
            public readonly context = injectContext<PolymorpheusContext<string>>();

            public readonly isContext = this.context instanceof PolymorpheusContext;
            public readonly hasImplicit = '$implicit' in this.context;
            public readonly keys = Object.keys(this.context).join(',');
            public readonly spread = Object.keys({...this.context}).join(',');
            public readonly json = JSON.stringify(this.context);
        }

        testComponent.context = 'value';
        testComponent.content = new PolymorpheusComponent(ContextShapeComponent);

        fixture.detectChanges();

        expect(text()).toBe('true:true:$implicit:$implicit:{"$implicit":"value"}');
    });
});
