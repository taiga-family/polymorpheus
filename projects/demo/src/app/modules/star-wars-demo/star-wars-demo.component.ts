import {ChangeDetectionStrategy, Component} from '@angular/core';
import {HighlightAuto} from 'ngx-highlightjs';

import {AbstractDemo} from '../abstract-demo';
import * as TypeScript from '../star-wars/star-wars.component.ts?raw';
import * as Style from '../star-wars/star-wars.style.less?raw';
import * as HTML from '../star-wars/star-wars.template.html?raw';
import {TabsComponent} from '../tabs/tabs.component';

@Component({
    selector: 'app-star-wars-demo',
    imports: [HighlightAuto, TabsComponent],
    templateUrl: './star-wars-demo.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarWarsDemoComponent extends AbstractDemo {
    public readonly example = {HTML, Style, TypeScript};
}
