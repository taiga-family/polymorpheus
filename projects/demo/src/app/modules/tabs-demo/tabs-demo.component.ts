import {ChangeDetectionStrategy, Component} from '@angular/core';
import {PolymorpheusComponent, type PolymorpheusContent} from '@taiga-ui/polymorpheus';
import {HighlightModule} from 'ngx-highlightjs';

import {AbstractDemo} from '../abstract-demo';
import {avatar, gear} from '../constants';
import {type CustomTab} from '../interfaces';
import {TabComponent} from '../tab/tab.component';
import * as typescript from '../tab/tab.component.ts?raw';
import * as css from '../tab/tab.style.less?raw';
import * as html from '../tab/tab.template.html?raw';
import {TabsComponent} from '../tabs/tabs.component';
import * as TypeScript from '../tabs/tabs.component.ts?raw';
import * as Style from '../tabs/tabs.style.less?raw';
import * as HTML from '../tabs/tabs.template.html?raw';

@Component({
    selector: 'app-tabs-demo',
    imports: [HighlightModule, TabsComponent],
    templateUrl: './tabs-demo.template.html',
    styleUrl: './tabs-demo.style.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsDemoComponent extends AbstractDemo {
    protected readonly avatar = avatar;

    protected readonly items = [
        'Search for Holy Grail',
        'Run away!',
        'Taunt a second time',
    ];

    protected readonly anotherExample: Record<string, string> = {
        HTML: html as unknown as string,
        Style: css as unknown as string,
        TypeScript: typescript as unknown as string,
    };

    protected readonly content = new PolymorpheusComponent(TabComponent);

    protected activeTabTab = 'HTML';

    protected customTabs: readonly CustomTab[] | null = null;

    public readonly example = {HTML, Style, TypeScript};

    protected get tabCode(): string {
        const code: any = this.anotherExample[this.activeTabTab];

        return typeof code === 'string' ? code : code.default;
    }

    protected getTabs(content: PolymorpheusContent<never>): readonly CustomTab[] {
        const customTabs = [
            {
                text: 'Alex Inkin',
                content,
            },
            {
                text: 'Messages',
                content: 3,
            },
            {
                text: 'Settings',
                content: gear,
            },
        ];

        this.customTabs = customTabs;

        return customTabs;
    }
}
