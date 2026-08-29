export interface Airport {
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  activeRoutesCount: number;
  avgFare: number;
  indexMovement: number; // percentage
  tier: 1 | 2;
  dailyFlights: number;
}

export interface FlightRoute {
  id: string;
  origin: string; // airport code e.g. DEL
  destination: string; // airport code e.g. BOM
  originCity: string;
  destCity: string;
  currentFare: number;
  referenceFare: number;
  baselineFare: number; // base 100 benchmark
  changePercent: number; // vs last month
  deviationPercent: number; // vs normal expected
  isAnomaly: boolean;
  anomalySeverity?: 'critical' | 'high' | 'moderate';
  anomalyReason?: string;
  historicalAvg: number;
  minFare: number;
  maxFare: number;
  observationsCount: number;
  volatilityIndex: number; // 0-100
  dominantCarrier: string;
  primaryAirline: string;
  sources?: string[];
  sectorType: 'Metro-Metro' | 'Metro-Tier2' | 'Tier2-Tier2' | 'Leisure';
  distanceKm: number;
  weeklyFrequency: number;
  historicalData: {
    date: string;
    fare: number;
    upperBand: number;
    lowerBand: number;
    volume: number;
  }[];
}

export interface IndexPoint {
  date: string;
  indexValue: number;
  baseline: number;
  monthlyChange: number;
  observations: number;
  upperConfidence?: number;
  lowerConfidence?: number;
}

export interface CPIDataPoint {
  month: string;
  airfareIndex: number;
  cpiGeneral: number;
  cpiTransport: number;
  divergence: number;
}

export interface RouteWeight {
  routeId: string;
  origin: string;
  destination: string;
  originCity: string;
  destCity: string;
  weight: number; // in percentage e.g. 16.4
  contribution: number; // index contribution points
  paxPerMonth: string;
  carrierShare: string;
  status: 'normal' | 'elevated' | 'anomaly';
}

export type RouteBasketStatus = 'Active' | 'Inactive';

export interface RouteBasketItem {
  id: string;
  route: string;
  originCode: string;
  destinationCode: string;
  originCity: string;
  destinationCity: string;
  weight: number;
  status: RouteBasketStatus;
  lastUpdated: string;
}

export type GovernmentOrganization = 'MoSPI' | 'NSO' | 'RBI';
export type GovernmentUserRole = 'MoSPI Admin' | 'NSO Official' | 'RBI Analyst';
export type AccountStatus = 'Active' | 'Inactive';

export interface GovernmentUser {
  id: string;
  name: string;
  email: string;
  organization: GovernmentOrganization;
  role: GovernmentUserRole;
  status: AccountStatus;
  lastLogin: string | null;
  createdOn: string;
  lastUpdated: string;
}

export interface KpaMetric {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'alert';
  iconType: 'plane' | 'route' | 'airline' | 'database' | 'alert' | 'activity' | 'trend';
  tooltip: string;
}

export interface SectorHeatmapItem {
  sector: string;
  label: string;
  routePairs: number;
  avgFare: number;
  baselineFare: number;
  indexScore: number;
  changePercent: number;
  volatility: number;
  status: 'Equilibrium' | 'Moderate Surge' | 'High Yield Stress' | 'Discounted';
  keyRoutes: string[];
}

export interface LeadTimeDataPoint {
  window: string;
  daysAdvance: string;
  avgFare: number;
  multiplier: number; // e.g. 1.0x, 1.72x
  markupPercent: number;
  seatInventoryShare: number;
  volatility: number;
  bookingUrgency: 'Normal' | 'Elevated' | 'Surge' | 'Critical Dynamic';
}

export interface PriceTrendPoint {
  date: string;
  nationalIndex: number;
  delBom: number;
  delBlr: number;
  bomBlr: number;
  delCcu: number;
  delHyd: number;
}

export interface LiveTelemetryEvent {
  id: string;
  timestamp: string;
  route: string;
  origin: string;
  dest: string;
  carrier: string;
  observedFare: number;
  changeType: 'spike' | 'up' | 'down' | 'stable';
  deviation: number;
}
