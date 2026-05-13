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

        this.updateComponentInputs();
        this.c?.injector.get(ChangeDetectorRef).markForCheck();

        if (!content) {
            return;
        }

        this.vcr.clear();

        const liveContext = this.createLiveContextProxy();

        if (isComponent(this.content)) {
            this.createComponent(
                this.content,
                this.context === undefined ? undefined : liveContext,
            );
            this.updateComponentInputs();
        } else if (
            (context instanceof PolymorpheusContext && context.$implicit) != null
        ) {
            this.vcr.createEmbeddedView(this.template, liveContext, {injector: this.i});
        }
    }

    public ngDoCheck(): void {
        if (isPolymorpheusTemplate(this.content)) {
            this.content.check();
        }
    }

    private get template(): TemplateRef<unknown> {
        if (isPolymorpheusTemplate(this.content)) {
            return this.content.template;
        }

        return this.content instanceof TemplateRef ? this.content : this.t;
    }

    private getContext(): C | PolymorpheusContext<any> | undefined {
        return isTemplate(this.content) || isComponent(this.content)
            ? this.context
            : new PolymorpheusContext(
                  typeof this.content === 'function'
                      ? this.content(this.context ?? ({} as any))
                      : this.content,
              );
    }

    private createComponent(content: PolymorpheusComponent<unknown>, proxy?: C): void {
        const injector = content.createInjector(this.i, proxy);

        this.c = this.vcr.createComponent(content.component, {injector});
    }

    private updateComponentInputs(): void {
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

    /**
     * Creates a stable context object for Angular templates/injection.
     *
     * The proxy always reads values from the latest context,
     * so embedded views and injected context do not become stale
     * when `this.context` changes.
     */
    private createLiveContextProxy(): C {
        const getEnsuredContext = () => ensureContext(this.getContext());

        return new Proxy(getEnsuredContext() as object, {
            get: (_, key) => getEnsuredContext()?.[key as keyof (C | PolymorpheusContext<any>)],
            has: (_, key) => key in (getEnsuredContext() ?? {}),
            ownKeys: () => Reflect.ownKeys(getEnsuredContext() as object),
            getOwnPropertyDescriptor: (_, key) => {
                const context = getEnsuredContext() as object;

                return key in context
                    ? {
                          enumerable: true,
                          configurable: true,
                      }
                    : undefined;
            },
        }) as unknown as C;
    }
}

function isPolymorpheusTemplate<C>(
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
    return isPolymorpheusTemplate(content) || content instanceof TemplateRef;
}

function ensureContext<C>(
    context: C | PolymorpheusContext<any> | undefined,
): C | PolymorpheusContext<any> | undefined {
    return isPrimitive(context) ? new PolymorpheusContext(context) : context;
}
