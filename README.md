# Polymorpheus

[![npm version](https://img.shields.io/npm/v/@taiga-ui/polymorpheus.svg)](https://npmjs.com/package/@taiga-ui/polymorpheus)
[![Coverage Status](https://codecov.io/gh/taiga-family/ng-polymorpheus/branch/master/graphs/badge.svg)](https://app.codecov.io/gh/taiga-family/ng-polymorpheus/tree/master/projects)
[![angular-open-source-starter](https://img.shields.io/badge/made%20with-angular--open--source--starter-d81676?logo=angular)](https://github.com/taiga-family/angular-open-source-starter)
[![telegram chat](https://img.shields.io/badge/support-Contact%20us-blue)](https://t.me/taiga_ui)

**Polymorpheus** is a tiny library for polymorphic templates in Angular.

It is 1 KB gzip, dependency free and allows you to make pretty cool things.

![Polymorpheus](projects/demo/assets/logo.svg)

## What does it do?

It abstracts over different ways of view customization in Angular with one simple _structural directive_:

```html
<ng-container *polymorpheusOutlet="content as text; context: context">{{text}}</ng-container>
```

**Content** accepts:

- primitives like `number` or `string`
- functions that take `context` as argument and return a primitive
- templates that get instantiated with given `context`
- components that would get `context` injected through DI

**Context** is optional when you need your **content** to adapt to the situation

## How to use it?

Typical use case would be a component that accepts visual customization and defines context by itself. Say a menu list
where you can configure how each item should look like by passing a template. And context would be item itself and, for
example, whether it is focused or not.

Please see [extensive demo](https://stackblitz.com/edit/polymorpheus-demo) (wait for packages to install and run
`npm start`).

You can also
[read about this concept in detail](https://medium.com/angular-in-depth/agnostic-components-in-angular-2427923b742d).

### Accessing context in dynamic component

If you use component content you can inject context with `POLYMORPHEUS_CONTEXT` token or `injectContext` helper.

**Important:** this object is _live_ so if you change it, your component view will be updated as well automatically.

```ts
import {injectContext} from '@taiga-ui/polymorpheus';

@Component({
  template: '{{ context.active }}', // <-- this will automatically update
})
export class MyComponent {
  protected readonly context = injectContext<{active: boolean}>();
}
```

Alternatively, inputs can be used and will be synced with according context keys:

```ts
import {input} from '@angular/core';

@Component({
  template: '{{ active() }}',
})
export class MyComponent {
  // Will be automatically updated by context.active changes
  protected readonly active = input(false);
}
```

### Adding type to template context

You can use `polymorpheus` directive to add type to template context:

```typescript
readonly context!: { $implicit: number };
```

```html
<ng-template
  #template="polymorpheus"
  [polymorpheus]="context"
  let-item
>
  {{ item.toFixed(2) }} <-- type 'number'
</ng-template>
```

## Core team

<table>
    <tr>
       <td align="center">
            <a href="https://twitter.com/waterplea"
                ><img
                    src="https://github.com/waterplea.png?size=100"
                    width="100"
                    style="margin-bottom: -4px; border-radius: 8px;"
                    alt="Alex Inkin"
                /><br /><b>Alex Inkin</b></a
            >
            <div style="margin-top: 4px">
                <a
                    href="https://twitter.com/waterplea"
                    title="Twitter"
                    ><img
                        width="16"
                        src="https://raw.githubusercontent.com/MarsiBarsi/readme-icons/main/twitter.svg"
                /></a>
                <a href="https://github.com/waterplea" title="Github"
                    ><img
                        width="16"
                        src="https://raw.githubusercontent.com/MarsiBarsi/readme-icons/main/github.svg"
                /></a>
                <a
                    href="https://t.me/waterplea"
                    title="Telegram"
                    ><img
                        width="16"
                        src="https://raw.githubusercontent.com/MarsiBarsi/readme-icons/main/send.svg"
                /></a>
            </div>
        </td>
        <td align="center">
            <a href="https://twitter.com/marsibarsi"
                ><img
                    src="https://github.com/marsibarsi.png?size=100"
                    width="100"
                    style="margin-bottom: -4px; border-radius: 8px;"
                    alt="Roman Sedov"
                /><br /><b>Roman Sedov</b></a
            >
            <div style="margin-top: 4px">
                <a
                    href="https://twitter.com/marsibarsi"
                    title="Twitter"
                    ><img
                        width="16"
                        src="https://raw.githubusercontent.com/MarsiBarsi/readme-icons/main/twitter.svg"
                /></a>
                <a
                    href="https://github.com/marsibarsi"
                    title="GitHub"
                    ><img
                        width="16"
                        src="https://raw.githubusercontent.com/MarsiBarsi/readme-icons/main/github.svg"
                /></a>
                <a
                    href="https://t.me/marsibarsi"
                    title="Telegram"
                    ><img
                        width="16"
                        src="https://raw.githubusercontent.com/MarsiBarsi/readme-icons/main/send.svg"
                /></a>
            </div>
        </td>
    </tr>
</table>

**ng-polymorpheus** is a part of [Taiga UI](https://github.com/taiga-family/taiga-ui) libraries family which is backed
and used by a large enterprise. This means you can rely on timely support and continuous development.
