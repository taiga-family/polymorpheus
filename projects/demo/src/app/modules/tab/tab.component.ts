import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {PolymorpheusOutlet, PolymorpheusTemplate} from '@taiga-ui/polymorpheus';

import {type CustomTab} from '../interfaces';

@Component({
    selector: 'app-tab',
    imports: [PolymorpheusOutlet],
    templateUrl: './tab.template.html',
    styleUrl: './tab.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
    protected readonly templateActive = computed(
        () => this.active() && this.$implicit().content instanceof PolymorpheusTemplate,
    );

    public readonly $implicit = input.required<CustomTab>();
    public readonly active = input(false);

    protected isNumber(primitive: number | string): primitive is number {
        return typeof primitive === 'number';
    }
}
