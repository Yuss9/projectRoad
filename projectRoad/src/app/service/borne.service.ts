import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map, tap} from "rxjs/operators";

export const plugServiceURL = "https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve";

@Injectable({
  providedIn: 'root'
})
export class BorneService {


  allPlugs: any[] = []

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

  // return all electric borne on the road
  // x y are the coordinates of first placement of Plug
  // getALlPlugs(x: number, y: number, distance: number, autonomy: number, distanceKm: number, lenghtCoord: number, coord: any[]) {
  //
  //   let numberOfPlugs = Math.floor(autonomy / distanceKm);
  //   for (var i = 0; i < numberOfPlugs; i++) {
  //     this.getPlugsNearCoordinate(x, y, distance).pipe(
  //       map((value: any) => {
  //           let plug = {
  //             name: value.name,
  //             latitude: value.latitude,
  //             longitude: value.longitude,
  //             observations: value.observations
  //           };
  //           this.allPlugs.push(plug);
  //           return this.allPlugs;
  //         }
  //       ));// end map
  //
  //     // formule
  //     let index = (autonomy * lenghtCoord) / distanceKm;
  //     index = index - 400;
  //     index = Math.floor(index);
  //     // RECUPERE LES COORDONNEES INITIALE
  //     x = coord[index].lat;
  //     y = coord[index].lon;
  //     console.log(i);
  //     console.log(this.allPlugs);
  //   }
  //   return this.allPlugs;
  // }


  // getALlPlugs(x: number, y: number, distance: number, autonomy: number, distanceKm: number, lenghtCoord: number, coord: any[], indexArray: number[]): Observable<any> {
  //   let numberOfPlugs = Math.floor(autonomy / distanceKm);
  //   let observables = [];
  //
  //   for (let i = 0; i < numberOfPlugs - 1; i++) {
  //     let observable = this.getPlugsNearCoordinate(x, y, distance).pipe(
  //       map((value: any) => {
  //         let plug = {
  //           name: value.name,
  //           latitude: value.latitude,
  //           longitude: value.longitude,
  //           observations: value.observations
  //         };
  //         return plug;
  //       })
  //     );
  //     observables.push(observable);
  //     let index = indexArray[i];
  //     x = coord[index].lat;
  //     y = coord[index].lon;
  //   }
  //   console.log("service ", observables)
  // }


  getPlugsNearCoordinate(x: number, y: number, distance: number): Observable<Object> {
    return this.http.get(plugServiceURL + "&geofilter.distance=" + x + "%2C" + y + "%2C" + distance).pipe(
      tap((data: any) => console.log(data)),
      map((data: any) => {
        let name = data["records"][0].fields.ad_station;
        let latitude = data["records"][0].geometry.coordinates[1];
        let longitude = data["records"][0].geometry.coordinates[0];
        let observations = data["records"][0].fields.observations;
        return {name, latitude, longitude, observations};
      })
    )
  }
}
