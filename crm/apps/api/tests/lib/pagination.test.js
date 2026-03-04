import { describe, it, expect } from 'vitest';
import { buildPagination } from '../../src/lib/pagination';
describe('pagination', () => {
    it('총 페이지 계산과 네비게이션 플래그를 정상 계산한다', () => {
        const result = buildPagination(2, 20, 45);
        expect(result).toMatchObject({
            page: 2,
            pageSize: 20,
            total: 45,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
        });
    });
});
//# sourceMappingURL=pagination.test.js.map