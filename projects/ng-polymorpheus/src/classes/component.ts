import {Injector, type Type} from '@angular/core';

import {provideContext} from '../tokens/context';

/**
 * Wrapper class for a component that will be used as content for {@link PolymorpheusOutlet}
 *
 * @param component — an Angular component to be dynamically created
 * @param injector — optional {@link Injector} for lazy loaded module case
 */
export class PolymorpheusComponent<T> {
    constructor(
        public readonly component: Type<T>,
        private readonly i?: Injector,
    ) {}

    public createInjector<C>(injector: Injector, useValue?: C): Injector {
        return Injector.create({
            parent: this.i || injector,
            providers: useValue ? [provideContext(useValue)] : [],
        });
    }
}
