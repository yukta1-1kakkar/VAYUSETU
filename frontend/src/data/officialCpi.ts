export interface OfficialCpiPoint {
  period: string;
  month: string;
  combined: number;
  rural: number;
  urban: number;
}

// Parsed from backend/data/processed/cpi_reference.csv, which is generated
// from the supplied MoSPI CPI Dashboard workbook (July 2026 release).
export const OFFICIAL_CPI_SERIES: OfficialCpiPoint[] = [
  { period: '2025-01', month: 'Jan 2025', combined: 101.67, rural: 101.81, urban: 101.49 },
  { period: '2025-02', month: 'Feb 2025', combined: 101.32, rural: 101.33, urban: 101.30 },
  { period: '2025-03', month: 'Mar 2025', combined: 101.39, rural: 101.34, urban: 101.47 },
  { period: '2025-04', month: 'Apr 2025', combined: 101.58, rural: 101.49, urban: 101.71 },
  { period: '2025-05', month: 'May 2025', combined: 101.90, rural: 101.78, urban: 102.06 },
  { period: '2025-06', month: 'Jun 2025', combined: 102.51, rural: 102.39, urban: 102.66 },
  { period: '2025-07', month: 'Jul 2025', combined: 103.35, rural: 103.34, urban: 103.36 },
  { period: '2025-08', month: 'Aug 2025', combined: 103.74, rural: 103.84, urban: 103.60 },
  { period: '2025-09', month: 'Sep 2025', combined: 103.74, rural: 103.80, urban: 103.66 },
  { period: '2025-10', month: 'Oct 2025', combined: 103.74, rural: 103.85, urban: 103.61 },
  { period: '2025-11', month: 'Nov 2025', combined: 104.01, rural: 104.16, urban: 103.83 },
  { period: '2025-12', month: 'Dec 2025', combined: 104.10, rural: 104.19, urban: 103.98 },
  { period: '2026-01', month: 'Jan 2026', combined: 104.45, rural: 104.59, urban: 104.28 },
  { period: '2026-02', month: 'Feb 2026', combined: 104.57, rural: 104.74, urban: 104.36 },
  { period: '2026-03', month: 'Mar 2026', combined: 104.84, rural: 105.02, urban: 104.62 },
  { period: '2026-04', month: 'Apr 2026', combined: 105.12, rural: 105.28, urban: 104.92 },
  { period: '2026-05', month: 'May 2026', combined: 105.91, rural: 106.11, urban: 105.66 },
  { period: '2026-06', month: 'Jun 2026', combined: 107.00, rural: 107.24, urban: 106.69 },
  { period: '2026-07', month: 'Jul 2026', combined: 107.94, rural: 108.34, urban: 107.45 },
];

export const OFFICIAL_CPI_SOURCE = 'MoSPI CPI Dashboard Data - July 2026 release';
