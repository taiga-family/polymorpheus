import {
    ChangeDetectionStrategy,
    Component,
    createEnvironmentInjector,
    ElementRef,
    EnvironmentInjector,
    inject,
    Injectable,
    type OnDestroy,
    type TemplateRef,
    viewChild,
    ViewContainerRef,
} from '@angular/core';
import {type ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {
    injectContext,
    PolymorpheusComponent,
    type PolymorpheusContent,
    PolymorpheusOutlet,
    PolymorpheusTemplate,
} from '@taiga-ui/polymorpheus';

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
        const dir = {polymorpheus: {}} as unknown as PolymorpheusTemplate<unknown>;
        const result = PolymorpheusTemplate.ngTemplateContextGuard(dir, {});

        expect(result).toBe(true);
    });

    it('directive static type check exists', () => {
        const dir = {polymorpheus: {}} as unknown as PolymorpheusOutlet<unknown>;
        const result = PolymorpheusOutlet.ngTemplateContextGuard(dir, {});

        expect(result).toBe(true);
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

    describe('EnvironmentInjector', () => {
        @Injectable()
        class EnvironmentService {
            public readonly value = 'from environment injector';
        }

        @Component({
            template: '{{ service.value }}',
            changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class EnvironmentContent {
            public readonly service = inject(EnvironmentService);
        }

        @Component({
            imports: [PolymorpheusOutlet],
            template: `
                <ng-container *polymorpheusOutlet="content" />
            `,
            changeDetection: ChangeDetectionStrategy.OnPush,
        })
        class HostComponent implements OnDestroy {
            private readonly parentEnvironment = inject(EnvironmentInjector);

            public readonly outlet =
                viewChild.required<PolymorpheusOutlet<EnvironmentContent>>(
                    PolymorpheusOutlet,
                );

            public readonly vcr = viewChild.required(PolymorpheusOutlet, {
                read: ViewContainerRef,
            });

            public readonly environment = createEnvironmentInjector(
                [EnvironmentService],
                this.parentEnvironment,
            );

            public readonly content = new PolymorpheusComponent(
                EnvironmentContent,
                this.environment,
            );

            public ngOnDestroy(): void {
                this.environment.destroy();
            }
        }

        it('creates component using providers from environment injector', () => {
            const fixture = TestBed.createComponent(HostComponent);
            const viewContainerRef = fixture.componentInstance.vcr;
            const outlet = fixture.componentInstance.outlet;

            expect(viewContainerRef).toBeDefined();
            expect(outlet).toBeDefined();

            const createComponentSpy = jest.spyOn(
                // @ts-ignore
                outlet().vcr,
                'createComponent',
            );

            fixture.detectChanges();

            expect(createComponentSpy).toHaveBeenCalled();

            const [, options] = createComponentSpy.mock.calls[0] ?? [];
            const environmentInjector = (
                options as {environmentInjector?: EnvironmentInjector} | null
            )?.environmentInjector;

            expect(fixture.nativeElement.textContent.trim()).toBe(
                'from environment injector',
            );

            expect(environmentInjector).toBe(fixture.componentInstance.environment);

            createComponentSpy.mockRestore();
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
});
