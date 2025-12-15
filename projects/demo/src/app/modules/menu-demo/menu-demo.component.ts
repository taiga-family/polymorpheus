import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HighlightModule} from 'ngx-highlightjs';

import {AbstractDemo} from '../abstract-demo';
import {MenuComponent} from '../menu/menu.component';
import * as TypeScript from '../menu/menu.component.ts?raw';
import * as Style from '../menu/menu.style.less?raw';
import * as HTML from '../menu/menu.template.html?raw';
import {TabsComponent} from '../tabs/tabs.component';

@Component({
    selector: 'app-menu-demo',
    imports: [HighlightModule, MenuComponent, TabsComponent],
    templateUrl: './menu-demo.template.html',
    styleUrl: './menu-demo.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDemoComponent extends AbstractDemo {
    protected readonly items = [
        'Search for Holy Grail',
        'Run away!',
        'Taunt a second time',
    ];

    public readonly example = {HTML, Style, TypeScript};
}
