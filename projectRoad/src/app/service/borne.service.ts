import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export const plugServiceURL = "https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve"

@Injectable({
  providedIn: 'root'
})
export class BorneService {

  constructor(private http: HttpClient) {
  }

  // getLatLongOfCity(city: string): Observable<any> {
  //
  // }

  getNameofCity(latitude: number, longitude: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    return this.http.get<any>(url);
  }

  getCities(name: string): Observable<any> {
    var url = "https://nominatim.openstreetmap.org/" + "search?q=" + name + "&format=json"
    return this.http.get<any>(url).pipe(
      map(value => {
        var cities: string[] = [];
        // for (var i = 0; i < value.length; i++) {
        //   cities.push(value[i].display_name);
        // }
        for (var i = 0; i < 10; i++) {
          cities.push(value[i].display_name);
        }
        return cities;
      })
    );
  }

  onUserInput(event: any) {
    this.getCities(event.target.value).pipe();
  }

  getLongLatOfCity(city: string, country: string, codePostal: string): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/search?q=${city}&country=${country}&format=json`;
    return this.http.get<any>(url).pipe(
      map(value => {
        var place = {lat: value[0].lat, lon: value[0].lon};
        for (var i = 0; i < value.length; i++) {
          if (value[i].display_name.includes(codePostal)) {
            place = {lat: value[i].lat, lon: value[i].lon};
          }
        }
        return place;
      })
    );
  }

  getNearbyChargingStationsWithAutonomy(latitude: string, longitude: string, radius: string): Observable<any> {
    //https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve&q=&rows=10&geofilter.distance=48.8520930694%2C2.34738897685%2C100&refine.distance_autonomie%3E=100
    console.log(latitude)
    console.log(longitude)
    console.log(radius)
    const urlVar = plugServiceURL + "&q=&rows=10&geofilter.distance=" + latitude + "%2C" + longitude + "%2C" + radius;
    const url = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve&q=&rows=10&geofilter.distance=48.8520930694%2C2.34738897685%2C100&refine.distance_autonomie%3E=100`;
    console.log(urlVar)
    console.log(url)
    return this.http.get<any>(urlVar).pipe(
      map(value => {
          // parcours la liste des bornes et reucpere les infos suivant  : puiss_max, geo_point_borne, ad_station, accessibilite
          console.log(value)
          var bornes = [];
          console.log(value.records.length)
          for (var i = 0; i < value.records.length; i++) {
            bornes.push({
              puissMax: value.records[i].fields.puiss_max,
              geo_point_borne: value.records[i].fields.geo_point_borne,
              ad_station: value.records[i].fields.ad_station,
              accessibilite: value.records[i].fields.accessibilite
            });
          }
          return bornes;
        }
      ));
  }


  getNearbyChargingStations(latitude: number, longitude: number, radius: number): Observable<any> {
    const url = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve&q=&geofilter.polygon=(48.883086%2C2.379072)%2C(48.879022%2C2.379930)%2C(48.883651%2C2.386968)`;
    return this.http.get<any>(url);
  }
}
