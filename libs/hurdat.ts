interface FetchOptions {
  method: string;
  headers: {
    'Content-Type': string;
  };
}

interface WindRadii {
  ne: number;
  se: number;
  sw: number;
  nw: number;
}

interface StormDataPoint {
  date: number;
  time_utc: number;
  status: string;
  max_wind_kt: number;
  record?: string;
  min_pressure_mb?: number;
  lat: number;
  lng: number;
  '34kt_wind_nm'?: WindRadii;
  '50kt_wind_nm'?: WindRadii;
  '64kt_wind_nm'?: WindRadii;
}

interface Storm {
  id: string;
  data: StormDataPoint[];
  image?: string;
  retired?: boolean;
  cost_usd?: number;
  dead_or_missing?: number;
}

const options: FetchOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getArchive = async (basin: string, year: number): Promise<Storm[] | undefined> => {
  try {
    const response = await fetch(`/api/archive/${basin}/${year}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Storm[] = await response.json();
    return data;
  } catch (err) {
    console.error('Server error', err);
  }
};

export type { Storm, StormDataPoint, WindRadii };
