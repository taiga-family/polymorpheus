import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {type PolymorpheusContent, PolymorpheusOutlet} from '@taiga-ui/polymorpheus';

import {type ContextWithActive} from '../interfaces';

@Component({
    selector: 'app-tabs',
    imports: [PolymorpheusOutlet],
    templateUrl: './tabs.template.html',
    styleUrl: './tabs.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent<T> {
    public readonly tabs = input<readonly T[]>([]);
    public readonly activeTab = model<T>();
    public readonly content = input<PolymorpheusContent<ContextWithActive<T>>>(
        ({$implicit}) => String($implicit),
    );
}
