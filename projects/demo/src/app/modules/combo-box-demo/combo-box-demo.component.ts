import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HighlightModule} from 'ngx-highlightjs';

import {AbstractDemo} from '../abstract-demo';
import {ComboBoxComponent} from '../combo-box/combo-box.component';
import * as TypeScript from '../combo-box/combo-box.component.ts?raw';
import * as Style from '../combo-box/combo-box.style.less?raw';
import * as HTML from '../combo-box/combo-box.template.html?raw';
import {TabsComponent} from '../tabs/tabs.component';

@Component({
    selector: 'app-combo-box-demo',
    imports: [ComboBoxComponent, HighlightModule, TabsComponent],
    templateUrl: './combo-box-demo.template.html',
    styleUrl: './combo-box-demo.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboBoxDemoComponent extends AbstractDemo {
    protected readonly items = [
        'Graham Chapman',
        'John Cleese',
        'Terry Gilliam',
        'Eric Idle',
        'Terry Jones',
        'Michael Palin',
    ];

    public readonly example = {HTML, Style, TypeScript};
}
