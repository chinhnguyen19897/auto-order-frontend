import type {Order} from '../types/common';

export const checkLabels: Record<string, string> = {
  ALL: 'All orders', NEEDS_MATCHING: 'Needs matching', ZALO_MATCHED: 'Zalo matched',
  READY: 'Ready', CONFIRMED: 'Confirmed', ISSUES: 'Issues', MISSING_PHONE: 'Missing phone',
  MISSING_INFORMATION: 'Missing information', DUPLICATE: 'Duplicate', OTHER: 'Other issue',
  PAYMENT_REVIEW: 'Payment review'
};
export const workflowOptions = ['NEEDS_MATCHING', 'ZALO_MATCHED', 'READY', 'CONFIRMED'];
export const issueOptions = ['MISSING_PHONE', 'MISSING_INFORMATION', 'DUPLICATE', 'OTHER'];

export function matchesOrderFilter(order: Order, filter: string) {
  if (filter === 'ALL') return true;
  if (['CANCELLED', 'EXPIRED'].includes(order.status)) return order.status === filter;
  return order.checkStatus === filter || order.checkIssues.includes(filter) || order.status === filter;
}
