import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    model,
    signal,
} from '@angular/core';
import {type PolymorpheusContent} from '@taiga-ui/polymorpheus';

import {InputComponent} from '../input/input.component';
import {type ContextWithActive} from '../interfaces';
import {MenuComponent} from '../menu/menu.component';

@Component({
    selector: 'app-combo-box',
    imports: [InputComponent, MenuComponent],
    templateUrl: './combo-box.template.html',
    styleUrl: './combo-box.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboBoxComponent<T> {
    protected readonly string = signal('');
    protected readonly open = signal(false);

    protected readonly selected = computed(
        (value = this.value()) => value && this.items().includes(value),
    );

    protected readonly filtered = computed(() =>
        this.selected()
            ? this.items()
            : this.items().filter((item) =>
                  this.stringify()(item)
                      .toLowerCase()
                      .includes(this.string().toLowerCase()),
              ),
    );

    public readonly value = model<T>();
    public readonly placeholder = input('');
    public readonly stringify = input<(item: T) => string>(String);
    public readonly items = input<readonly T[]>([]);
    public readonly emptyContent = input<PolymorpheusContent<never>>('Nothing is found');
    public readonly content = input<PolymorpheusContent<ContextWithActive<T>>>(
        ({$implicit}: ContextWithActive<T>) => String($implicit),
    );

    protected onItemClicked(item: T): void {
        this.value.set(item);
        this.string.set(this.stringify()(item));
        this.open.set(false);
    }

    protected onValueChange(value: string): void {
        this.string.set(value);
        this.open.set(true);
        this.value.set(
            this.items().find((item) => this.stringify()(item) === this.string()),
        );
    }
}
