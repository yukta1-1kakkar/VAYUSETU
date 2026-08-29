export type UserRole = 'NSO' | 'RBI' | 'MOSPI_ADMIN';

export type Permission =
  | 'dashboard'
  | 'airfare-index'
  | 'reports'
  | 'downloads'
  | 'price-trends'
  | 'route-comparison'
  | 'lead-time-elasticity'
  | 'api-explorer'
  | 'user-management'
  | 'scraping-scheduler'
  | 'route-basket'
  | 'system-settings';

export interface AuthUser {
  name: string;
  role: UserRole;
  email: string;
}

interface AuthCredential extends AuthUser {
  password: string;
}

export const AUTH_STORAGE_KEY = 'vayusetu-auth';

// Temporary frontend-only credentials. Replace with the government identity
// provider once the authentication API is available.
export const AUTH_CREDENTIALS: readonly AuthCredential[] = [
  {
    name: 'NSO Official',
    role: 'NSO',
    email: 'nso@vayusetu.gov.in',
    password: 'NSO@123',
  },
  {
    name: 'RBI Analyst',
    role: 'RBI',
    email: 'rbi@vayusetu.gov.in',
    password: 'RBI@123',
  },
  {
    name: 'MoSPI Admin',
    role: 'MOSPI_ADMIN',
    email: 'admin@vayusetu.gov.in',
    password: 'ADMIN@123',
  },
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  NSO: 'NSO Official',
  RBI: 'RBI Analyst',
  MOSPI_ADMIN: 'MoSPI Admin',
};

const ALL_PERMISSIONS: readonly Permission[] = [
  'dashboard',
  'airfare-index',
  'reports',
  'downloads',
  'price-trends',
  'route-comparison',
  'lead-time-elasticity',
  'api-explorer',
  'user-management',
  'scraping-scheduler',
  'route-basket',
  'system-settings',
];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  NSO: ['dashboard', 'airfare-index', 'reports', 'downloads', 'route-basket', 'user-management'],
  RBI: [
    'dashboard',
    'price-trends',
    'route-comparison',
    'lead-time-elasticity',
    'api-explorer',
  ],
  MOSPI_ADMIN: ALL_PERMISSIONS,
};
