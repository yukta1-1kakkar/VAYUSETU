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
  upperConfidence: number;
  lowerConfidence: number;
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

export interface KpaMetric {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'alert';
  iconType: 'plane' | 'route' | 'airline' | 'database' | 'shield' | 'alert' | 'activity';
}

export interface DataQualityMetrics {
  overallConfidence: number;
  coverage: number;
  completeness: number;
  freshness: number;
  consistency: number;
  totalDailyScrapes: number;
  verifiedCarriers: number;
  activeMonitoringNodes: number;
  lastSyncTimestamp: string;
}

export interface DataSourceNode {
  id: string;
  name: string;
  type: 'carrier' | 'regulatory' | 'market' | 'macroeconomic';
  throughput: string;
  status: 'active' | 'syncing' | 'verified';
  latency: string;
  description: string;
  recordsPerDay: number;
}

export interface LiveTelemetryEvent {
  id: string;
  timestamp: string;
  route: string;
  origin: string;
  dest: string;
  carrier: string;
  observedFare: number;
  changeType: 'up' | 'down' | 'stable' | 'spike';
  deviation: number;
}
