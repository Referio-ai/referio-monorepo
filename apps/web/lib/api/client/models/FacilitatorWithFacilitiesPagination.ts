/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FacilitatorWithFacilities } from './FacilitatorWithFacilities';

export type FacilitatorWithFacilitiesPagination = {
    items: Array<FacilitatorWithFacilities>;
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    sort_by?: string;
    sort_order?: string;
};
