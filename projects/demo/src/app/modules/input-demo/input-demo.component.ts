import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HighlightModule} from 'ngx-highlightjs';

import {AbstractDemo} from '../abstract-demo';
import {InputComponent} from '../input/input.component';
import * as TypeScript from '../input/input.component.ts?raw';
import * as Style from '../input/input.style.less?raw';
import * as HTML from '../input/input.template.html?raw';
import {TabsComponent} from '../tabs/tabs.component';

@Component({
    selector: 'app-input-demo',
    imports: [HighlightModule, InputComponent, TabsComponent],
    templateUrl: './input-demo.template.html',
    styleUrl: './input-demo.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDemoComponent extends AbstractDemo {
    protected readonly searchIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M15.9,14.5l2.8,2.8c0.4,0.4,0.4,1,0,1.4c-0.4,0.4-1,0.4-1.4,0l-2.8-2.8c-2.7,1.9-6.4,1.3-8.4-1.4
            S4.8,8,7.5,6.1s6.4-1.3,8.4,1.4C17.4,9.6,17.4,12.4,15.9,14.5L15.9,14.5z M11,15c2.2,0,4-1.8,4-4s-1.8-4-4-4s-4,1.8-4,4
            S8.8,15,11,15z"/>
    </svg>`;

    public readonly example = {HTML, Style, TypeScript};
}
