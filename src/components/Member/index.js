/**
 * Member system main entry file
 * Export all member-related components for easy reference elsewhere
 */

import MemberListDefault from './MemberList';
import MemberAddDefault from './MemberAdd';
import MemberRechargeDefault from './MemberRecharge';
import MemberDashboardDefault from './MemberDashboard';
import AdminLoginDefault from './AdminLogin';
import StoreGroupConfigDefault from './StoreGroupConfig';

// Re-export utilities from memberUtils
export * from './memberUtils';

// Main components
export { default as MemberList } from './MemberList';
export { default as MemberAdd } from './MemberAdd';
export { default as MemberRecharge } from './MemberRecharge';
export { default as MemberDashboard } from './MemberDashboard';
export { default as AdminLogin } from './AdminLogin';
export { default as StoreGroupConfig } from './StoreGroupConfig';

// Translation utilities  
export { t, formatCurrency, formatDateTime } from './translations';

// Import from memberUtils for default export compatibility
import { memberUtils, rechargePackages, memberConfig } from './memberUtils';

export default {
  MemberList: MemberListDefault,
  MemberAdd: MemberAddDefault,
  MemberRecharge: MemberRechargeDefault,
  MemberDashboard: MemberDashboardDefault,
  AdminLogin: AdminLoginDefault,
  StoreGroupConfig: StoreGroupConfigDefault,
  memberUtils,
  rechargePackages,
  memberConfig
};