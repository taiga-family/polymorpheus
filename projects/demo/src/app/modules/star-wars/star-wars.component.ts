import {ChangeDetectionStrategy, Component} from '@angular/core';

import {ComboBoxComponent} from '../combo-box/combo-box.component';
import {ben, jedi, luke, sith, vader, yoda} from '../constants';

interface StarWarsChar {
    readonly name: string;
    readonly avatar: string;
    readonly jedi: boolean;
}

@Component({
    selector: 'app-star-wars',
    imports: [ComboBoxComponent],
    templateUrl: './star-wars.template.html',
    styleUrl: './star-wars.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarWarsComponent {
    protected readonly yoda = yoda;

    protected readonly items: readonly StarWarsChar[] = [
        {
            name: 'Luke Skywalker',
            avatar: luke,
            jedi: true,
        },
        {
            name: 'Obi-Wan Kenobi',
            avatar: ben,
            jedi: true,
        },
        {
            name: 'Darth Maul',
            avatar: '',
            jedi: false,
        },
        {
            name: 'Darth Vader',
            avatar: vader,
            jedi: false,
        },
        {
            name: 'Mace Windu',
            avatar: '',
            jedi: true,
        },
    ];

    protected readonly stringify: (char: StarWarsChar) => string = ({name}) => name;

    protected getInitials(name: string): string {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('');
    }

    protected getRace(isJedi: boolean): string {
        return isJedi ? jedi : sith;
    }
}
