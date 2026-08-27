import type { RouteBasketItem } from '../types';

export interface BasketAirport {
  code: string;
  city: string;
  lat: number;
  lng: number;
}

export const BASKET_AIRPORTS: readonly BasketAirport[] = [
  { code: 'DEL', city: 'Delhi', lat: 28.5562, lng: 77.1 },
  { code: 'BOM', city: 'Mumbai', lat: 19.0896, lng: 72.8656 },
  { code: 'BLR', city: 'Bengaluru', lat: 13.1986, lng: 77.7066 },
  { code: 'HYD', city: 'Hyderabad', lat: 17.2403, lng: 78.4294 },
  { code: 'CCU', city: 'Kolkata', lat: 22.6547, lng: 88.4467 },
  { code: 'PNQ', city: 'Pune', lat: 18.5822, lng: 73.9197 },
  { code: 'GOI', city: 'Goa', lat: 15.3808, lng: 73.8314 },
  { code: 'AMD', city: 'Ahmedabad', lat: 23.0772, lng: 72.6347 },
  { code: 'MAA', city: 'Chennai', lat: 12.9941, lng: 80.1709 },
  { code: 'SXR', city: 'Srinagar', lat: 33.9871, lng: 74.7743 },
  { code: 'GAU', city: 'Guwahati', lat: 26.1061, lng: 91.5859 },
  { code: 'PAT', city: 'Patna', lat: 25.5913, lng: 85.088 },
  { code: 'LKO', city: 'Lucknow', lat: 26.7606, lng: 80.8893 },
  { code: 'COK', city: 'Kochi', lat: 10.1556, lng: 76.3906 },
] as const;

const UPDATED_DATE = '27 Aug 2026';

// Top 24 city pairs from backend/data/processed/route_weights.csv, normalized
// against their combined passenger volume so the APIx basket totals 100%.
export const INITIAL_ROUTE_BASKET: RouteBasketItem[] = [
  ['DEL-BOM', 'DEL', 'BOM', 'Delhi', 'Mumbai', 11.43],
  ['BLR-DEL', 'BLR', 'DEL', 'Bengaluru', 'Delhi', 8.19],
  ['BLR-BOM', 'BLR', 'BOM', 'Bengaluru', 'Mumbai', 7.02],
  ['DEL-HYD', 'DEL', 'HYD', 'Delhi', 'Hyderabad', 5.28],
  ['DEL-CCU', 'DEL', 'CCU', 'Delhi', 'Kolkata', 5.05],
  ['DEL-PNQ', 'DEL', 'PNQ', 'Delhi', 'Pune', 4.83],
  ['GOI-BOM', 'GOI', 'BOM', 'Goa', 'Mumbai', 4.24],
  ['AMD-DEL', 'AMD', 'DEL', 'Ahmedabad', 'Delhi', 3.98],
  ['DEL-GOI', 'DEL', 'GOI', 'Delhi', 'Goa', 3.83],
  ['MAA-BOM', 'MAA', 'BOM', 'Chennai', 'Mumbai', 3.72],
  ['HYD-BOM', 'HYD', 'BOM', 'Hyderabad', 'Mumbai', 3.65],
  ['CCU-BOM', 'CCU', 'BOM', 'Kolkata', 'Mumbai', 3.64],
  ['MAA-DEL', 'MAA', 'DEL', 'Chennai', 'Delhi', 3.62],
  ['BLR-HYD', 'BLR', 'HYD', 'Bengaluru', 'Hyderabad', 3.45],
  ['AMD-BOM', 'AMD', 'BOM', 'Ahmedabad', 'Mumbai', 3.45],
  ['BLR-CCU', 'BLR', 'CCU', 'Bengaluru', 'Kolkata', 3.42],
  ['DEL-SXR', 'DEL', 'SXR', 'Delhi', 'Srinagar', 3.24],
  ['BLR-PNQ', 'BLR', 'PNQ', 'Bengaluru', 'Pune', 3.06],
  ['DEL-GAU', 'DEL', 'GAU', 'Delhi', 'Guwahati', 2.66],
  ['DEL-PAT', 'DEL', 'PAT', 'Delhi', 'Patna', 2.58],
  ['BLR-GOI', 'BLR', 'GOI', 'Bengaluru', 'Goa', 2.48],
  ['BLR-MAA', 'BLR', 'MAA', 'Bengaluru', 'Chennai', 2.47],
  ['DEL-LKO', 'DEL', 'LKO', 'Delhi', 'Lucknow', 2.42],
  ['COK-BOM', 'COK', 'BOM', 'Kochi', 'Mumbai', 2.29],
].map(([route, originCode, destinationCode, originCity, destinationCity, weight], index) => ({
  id: `basket-${index + 1}`,
  route: String(route),
  originCode: String(originCode),
  destinationCode: String(destinationCode),
  originCity: String(originCity),
  destinationCity: String(destinationCity),
  weight: Number(weight),
  status: 'Active',
  lastUpdated: UPDATED_DATE,
}));
