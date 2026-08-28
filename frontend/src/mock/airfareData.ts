/**
 * Live dashboard store. The legacy filename avoids a noisy import migration,
 * but this module contains no sample observations. LiveDataGate fills every
 * export from GET /api/dashboard/live before the protected portal mounts.
 */
import type {
  Airport, CPIDataPoint, FlightRoute, IndexPoint, KpaMetric, LeadTimeDataPoint,
  LiveTelemetryEvent, PriceTrendPoint, RouteWeight, SectorHeatmapItem,
} from '../types';
import { applyLiveMapData } from '../components/india-map/mapData';

export interface DataQuality {
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

export interface DataSource {
  id: string;
  name: string;
  type: string;
  throughput: string;
  status: string;
  latency: string;
  description: string;
  recordsPerDay: number;
}

export interface LiveDashboardPayload {
  hasData: boolean;
  generatedAt: string;
  kpaiMetrics: KpaMetric[];
  routeWeights: RouteWeight[];
  airports: Record<string, Airport>;
  flightRoutes: FlightRoute[];
  indexTimeline: IndexPoint[];
  cpiDataSeries: CPIDataPoint[];
  sectorHeatmapData: SectorHeatmapItem[];
  leadTimeByRoute: Record<string, LeadTimeDataPoint[]>;
  priceTrendSeries: PriceTrendPoint[];
  liveTelemetryFeed: LiveTelemetryEvent[];
  dataQuality: DataQuality;
  dataSources: DataSource[];
}

export let KPAI_METRICS: KpaMetric[] = [];
export let ROUTE_WEIGHTS_DATA: RouteWeight[] = [];
export let AIRPORTS: Record<string, Airport> = {};
export let FLIGHT_ROUTES: FlightRoute[] = [];
export let INDEX_TIMELINE: IndexPoint[] = [];
export let CPI_DATA_SERIES: CPIDataPoint[] = [];
export let SECTOR_HEATMAP_DATA: SectorHeatmapItem[] = [];
export let LEAD_TIME_ELASTICITY_DATA: LeadTimeDataPoint[] = [];
export let PRICE_TREND_SERIES: PriceTrendPoint[] = [];
export let LIVE_TELEMETRY_FEED: LiveTelemetryEvent[] = [];
export let DATA_QUALITY: DataQuality = {
  overallConfidence: 0, coverage: 0, completeness: 0, freshness: 0,
  consistency: 0, totalDailyScrapes: 0, verifiedCarriers: 0,
  activeMonitoringNodes: 0, lastSyncTimestamp: 'No observations',
};
export let DATA_SOURCES: DataSource[] = [];

let leadTimeByRoute: Record<string, LeadTimeDataPoint[]> = {};

export const getLeadTimeCurveForRoute = (routeId: string): LeadTimeDataPoint[] =>
  leadTimeByRoute[routeId] ?? leadTimeByRoute.ALL ?? [];

export function applyLiveDashboard(payload: LiveDashboardPayload): void {
  KPAI_METRICS = payload.kpaiMetrics;
  ROUTE_WEIGHTS_DATA = payload.routeWeights;
  AIRPORTS = payload.airports;
  FLIGHT_ROUTES = payload.flightRoutes;
  INDEX_TIMELINE = payload.indexTimeline;
  CPI_DATA_SERIES = payload.cpiDataSeries;
  SECTOR_HEATMAP_DATA = payload.sectorHeatmapData;
  leadTimeByRoute = payload.leadTimeByRoute;
  LEAD_TIME_ELASTICITY_DATA = payload.leadTimeByRoute.ALL ?? [];
  PRICE_TREND_SERIES = payload.priceTrendSeries;
  LIVE_TELEMETRY_FEED = payload.liveTelemetryFeed;
  DATA_QUALITY = payload.dataQuality;
  DATA_SOURCES = payload.dataSources;
  applyLiveMapData(payload.airports, payload.flightRoutes, payload.routeWeights, payload.indexTimeline.at(-1)?.indexValue ?? 0);
}
