import { Controller, Get, Query } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { Observable } from 'rxjs';

@Controller('geolocation')
export class GeolocationController {
  constructor(private geolocationService: GeolocationService) {}

  @Get('/geocoding/reverse')
  reverseGeocode(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ): Observable<{}> {
    return;
  }

  @Get('/geocoding/search')
  search(@Query('q') q: string): Observable<{}> {
    return;
  }
}
