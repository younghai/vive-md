import { describe, it, expect } from 'vitest';
import { clamp, toNumber } from '../../src/lib/shared';
describe('shared utils', () => {
    it('toNumber는 문자열 숫자를 변환한다', () => {
        expect(toNumber('12', 0)).toBe(12);
        expect(toNumber('abc', 7)).toBe(7);
    });
    it('clamp는 범위를 제한한다', () => {
        expect(clamp(120, 0, 100)).toBe(100);
        expect(clamp(-2, 0, 100)).toBe(0);
        expect(clamp(30, 0, 100)).toBe(30);
    });
});
//# sourceMappingURL=shared.test.js.map