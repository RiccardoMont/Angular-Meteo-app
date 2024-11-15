export interface City {
    formatted: string;
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  geometry: {
    lat: number;
    lng: number;
  };
  components: {
    city: string;
    town: string;
    _normalized_city: string;
  },
  meteo: {
    hourly: 
      {
        temperature_2m: Array<number>;
        time: Array<string>;
        weather_code: Array<number>;
      },
      hourly_units:
      {
        temperature_2m: string;
        time: string;
        weather_code: string;
      }
  };
}
