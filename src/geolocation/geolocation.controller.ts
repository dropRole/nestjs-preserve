import { Controller, Get, Query } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { Observable } from 'rxjs';
import { Privileges } from 'src/auth/privileges.decorator';
import { Privilege } from 'src/auth/enum/privilege.enum';

@Controller('geolocation')
export class GeolocationController {
  constructor(private geolocationService: GeolocationService) {}

  @Get('/geocoding/reverse')
  @Privileges(Privilege.OFFEREE)
  reverseGeocode(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ): Observable<{}> {
    return;
  }

  @Get('/geocoding/search')
  @Privileges(Privilege.OFFEROR)
  search(@Query('q') q: string): Observable<{}> {
    return;
  }
}
