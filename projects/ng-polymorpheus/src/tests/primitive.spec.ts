/* eslint-disable unicorn/new-for-builtins */
import {describe, expect, it} from '@jest/globals';

import {isPrimitive} from '../utils/is-primitive';

describe('isPrimitive', () => {
    it('should return true for primitive', () => {
        expect(isPrimitive(undefined)).toBe(true);
        expect(isPrimitive(null)).toBe(true);
        expect(isPrimitive(12)).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
        expect(isPrimitive(Number(12))).toBe(true);
        expect(isPrimitive('Hello world')).toBe(true);
        expect(isPrimitive(true)).toBe(true);
    });

    it('should return false for non primitive', () => {
        expect(isPrimitive([])).toBe(false);
        expect(isPrimitive({})).toBe(false);
        expect(isPrimitive(() => {})).toBe(false);
        expect(isPrimitive(new (class {})())).toBe(false);

        // noinspection JSPrimitiveTypeWrapperUsage
        expect(isPrimitive(new String('Hello world'))).toBe(false);

        // noinspection JSPrimitiveTypeWrapperUsage
        expect(isPrimitive(new Boolean(true))).toBe(false);
    });
});
