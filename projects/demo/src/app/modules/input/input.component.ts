import {ChangeDetectionStrategy, Component, input, model} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {type PolymorpheusContent, PolymorpheusOutlet} from '@taiga-ui/polymorpheus';

@Component({
    selector: 'app-input',
    imports: [FormsModule, PolymorpheusOutlet],
    templateUrl: './input.template.html',
    styleUrl: './input.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
    public readonly content = input<PolymorpheusContent<never>>();
    public readonly placeholder = input('');
    public readonly value = model('');
}
