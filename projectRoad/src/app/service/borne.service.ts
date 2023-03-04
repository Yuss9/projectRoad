import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export const plugServiceURL = "https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve";

@Injectable({
  providedIn: 'root'
})
export class BorneService {


  // service
  private API_URI = 'https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve&q=&';
  private APIGEO = 'https://nominatim.openstreetmap.org/';

  constructor(private http: HttpClient) {
  }

  getNameofCity(latitude: number, longitude: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    return this.http.get<any>(url);
  }

  getCities(name: string): Observable<any> {
    var url = "https://nominatim.openstreetmap.org/" + "search?q=" + name + "&format=json"
    return this.http.get<any>(url).pipe(
      map(value => {
        var cities: string[] = [];
        // for (var i = 0; i < value.length; i++)
        //   cities.push(value[i].display_name);
        // }
        for (var i = 0; i < 10; i++) {
          cities.push(value[i].display_name);
        }
        return cities;
      })
    );
  }

  getGeoCoding(cityName: string): Observable<{ lat: number, lon: number }> {
    const uri = `${this.APIGEO}/search?q=${cityName}&format=json`;

    return this.http.get<any>(uri).pipe(
      map(value => {
        return {lat: value[0].lat, lon: value[0].lon};
      })
    );
  }

  getBorne(lat: number, lon: number, radius: number): Observable<any[]> {
    const uri = this.API_URI + `geofilter.distance=${lat}%2C${lon}%2C${radius}`;

    return this.http.get<any>(uri).pipe(
      map(value => value.records[0])
    );
  }
}
