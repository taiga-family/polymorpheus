/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import {
    ChangeDetectorRef,
    type ComponentRef,
    Directive,
    type DoCheck,
    inject,
    INJECTOR,
    type OnChanges,
    reflectComponentType,
    type SimpleChanges,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';

import {PolymorpheusComponent} from '../classes/component';
import {PolymorpheusContext} from '../classes/context';
import {type PolymorpheusContent} from '../types/content';
import {type PolymorpheusPrimitive} from '../types/primitive';
import {isPrimitive} from '../utils/is-primitive';
import {PolymorpheusTemplate} from './template';

@Directive({
    selector: '[polymorpheusOutlet]',
    inputs: ['content: polymorpheusOutlet', 'context: polymorpheusOutletContext'],
})
export class PolymorpheusOutlet<C> implements OnChanges, DoCheck {
    private readonly vcr = inject(ViewContainerRef);
    private readonly i = inject(INJECTOR);
    private readonly t: TemplateRef<PolymorpheusContext<PolymorpheusPrimitive>> =
        inject(TemplateRef);

    private c?: ComponentRef<unknown>;

    public content: PolymorpheusContent<C> = '';
    public context?: C;

    public static ngTemplateContextGuard<T>(
        _dir: PolymorpheusOutlet<T>,
        _ctx: any,
    ): _ctx is PolymorpheusContext<T extends PolymorpheusPrimitive ? T : never> {
        return true;
    }

    public ngOnChanges({content}: SimpleChanges): void {
        const context = this.getContext();

        this.update();
        this.c?.injector.get(ChangeDetectorRef).markForCheck();

        if (!content) {
            return;
        }

        this.vcr.clear();

        const proxy =
            context &&
            (new Proxy(ensureContext(context) as object, {
                get: (_, key) =>
                    ensureContext(this.getContext())?.[
                        key as keyof (C | PolymorpheusContext<any>)
                    ],
            }) as unknown as C);

        if (isComponent(this.content)) {
            this.process(this.content, proxy);
            this.update();
        } else if (
            (context instanceof PolymorpheusContext && context.$implicit) != null
        ) {
            this.vcr.createEmbeddedView(this.template, proxy, {injector: this.i});
        }
    }

    public ngDoCheck(): void {
        if (isDirective(this.content)) {
            this.content.check();
        }
    }

    private get template(): TemplateRef<unknown> {
        if (isDirective(this.content)) {
            return this.content.template;
        }

        return this.content instanceof TemplateRef ? this.content : this.t;
    }

    private getContext(): C | PolymorpheusContext<any> | undefined {
        if (isTemplate(this.content) || isComponent(this.content)) {
            return this.context;
        }

        return new PolymorpheusContext(
            typeof this.content === 'function'
                ? this.content(this.context ?? ({} as any))
                : this.content,
        );
    }

    private process(content: PolymorpheusComponent<unknown>, proxy?: C): void {
        const injector = content.createInjector(this.i, proxy);

        this.c = this.vcr.createComponent(content.component, {injector});
    }

    private update(): void {
        const {context, content} = this;

        if (!context || typeof context !== 'object' || !isComponent(content)) {
            return;
        }

        const {inputs = []} = reflectComponentType(content.component) || {};

        for (const {templateName} of inputs) {
            if (templateName in context) {
                this.c?.setInput(templateName, context[templateName as keyof C]);
            }
        }
    }
}

function isDirective<C>(
    content: PolymorpheusContent<C>,
): content is PolymorpheusTemplate<C> {
    return content instanceof PolymorpheusTemplate;
}

function isComponent<C>(
    content: PolymorpheusContent<C>,
): content is PolymorpheusComponent<any> {
    return content instanceof PolymorpheusComponent;
}

function isTemplate<C>(
    content: PolymorpheusContent<C>,
): content is PolymorpheusTemplate<C> | TemplateRef<C> {
    return isDirective(content) || content instanceof TemplateRef;
}

function ensureContext<C>(
    context: C | PolymorpheusContext<any> | undefined,
): C | PolymorpheusContext<any> | undefined {
    if (context && isPrimitive(context)) {
        return new PolymorpheusContext(context);
    }

    return context;
}
