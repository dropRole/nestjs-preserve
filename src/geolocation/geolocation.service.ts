import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Observable, map } from 'rxjs';

@Injectable()
export class GeolocationService {
  private LOCATIONIQ_API_KEY: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.LOCATIONIQ_API_KEY = this.configService.get('LOCATIONIQ_API_KEY');
  }

  reverseGeocode(lat: string, lon: string): Observable<{}> {
    return this.httpService
      .get(
        `https://eu1.locationiq.com/v1/reverse?key=${this.LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&zoom=[10-18]&format=json`,
      )
      .pipe(map((response) => response.data));
  }

  search(q: string): Observable<{}> {
    return this.httpService
      .get(
        `https://api.locationiq.com/v1/search?key=${this.LOCATIONIQ_API_KEY}&q=${q}&format=json`,
      )
      .pipe(map((response) => response.data));
  }
}
