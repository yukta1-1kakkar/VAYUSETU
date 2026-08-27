import type { GovernmentUser, GovernmentUserRole } from '../types';

export const GOVERNMENT_USERS: GovernmentUser[] = [
  {
    id: 'user-mospi-admin',
    name: 'MoSPI Administrator',
    email: 'admin@vayusetu.gov.in',
    organization: 'MoSPI',
    role: 'MoSPI Admin',
    status: 'Active',
    lastLogin: '2026-08-27T09:42:00+05:30',
    createdOn: '2025-01-08T10:00:00+05:30',
    lastUpdated: '2026-08-27T09:42:00+05:30',
  },
  {
    id: 'user-nso-official',
    name: 'NSO Official',
    email: 'nso@vayusetu.gov.in',
    organization: 'NSO',
    role: 'NSO Official',
    status: 'Active',
    lastLogin: '2026-08-26T16:18:00+05:30',
    createdOn: '2025-02-14T11:30:00+05:30',
    lastUpdated: '2026-08-26T16:18:00+05:30',
  },
  {
    id: 'user-rbi-analyst',
    name: 'RBI Analyst',
    email: 'rbi@vayusetu.gov.in',
    organization: 'RBI',
    role: 'RBI Analyst',
    status: 'Active',
    lastLogin: '2026-08-26T14:05:00+05:30',
    createdOn: '2025-03-03T09:15:00+05:30',
    lastUpdated: '2026-08-26T14:05:00+05:30',
  },
  {
    id: 'user-nso-analyst',
    name: 'Data Analyst',
    email: 'analyst.nso@vayusetu.gov.in',
    organization: 'NSO',
    role: 'NSO Official',
    status: 'Active',
    lastLogin: '2026-08-25T11:27:00+05:30',
    createdOn: '2025-08-21T13:45:00+05:30',
    lastUpdated: '2026-08-25T11:27:00+05:30',
  },
  {
    id: 'user-rbi-api',
    name: 'API Consumer',
    email: 'api.rbi@vayusetu.gov.in',
    organization: 'RBI',
    role: 'RBI Analyst',
    status: 'Inactive',
    lastLogin: '2026-08-19T18:10:00+05:30',
    createdOn: '2026-01-12T10:20:00+05:30',
    lastUpdated: '2026-08-22T15:40:00+05:30',
  },
];

export const USER_ROLE_PERMISSIONS: Record<GovernmentUserRole, readonly string[]> = {
  'MoSPI Admin': ['Manage Users', 'Scraping Scheduler', 'Route Basket & Weights', 'Reports', 'Downloads', 'API Explorer'],
  'NSO Official': ['Dashboard', 'Airfare Index', 'Reports', 'Downloads'],
  'RBI Analyst': ['Dashboard', 'Price Trends', 'Route Comparison', 'Lead-Time Elasticity', 'API Explorer'],
};

