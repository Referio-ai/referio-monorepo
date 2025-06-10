/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReferralBatch } from './ReferralBatch';
/**
 * Response model for batch generation
 */
export type GenerateBatchResponse = {
    batch?: (ReferralBatch | null);
    referrals_created?: number;
    batch_prefix: string;
};

