import {ChangeDetectionStrategy, Component, input, output, signal} from '@angular/core';
import {type PolymorpheusContent, PolymorpheusOutlet} from '@taiga-ui/polymorpheus';

import {type ContextWithActive} from '../interfaces';

@Component({
    selector: 'app-menu',
    imports: [PolymorpheusOutlet],
    templateUrl: './menu.template.html',
    styleUrl: './menu.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'(mouseleave)': 'activeItem.set(null)'},
})
export class MenuComponent<T> {
    protected readonly activeItem = signal<T | null>(null);

    public readonly items = input<readonly T[]>([]);
    public readonly emptyContent = input<PolymorpheusContent<never>>('Nothing is found');
    public readonly content = input<PolymorpheusContent<ContextWithActive<T>>>(
        ({$implicit}) => String($implicit),
    );

    public readonly itemClicked = output<T>();
}
