import {Component, OnInit} from '@angular/core';
import {CalculSoapService} from "../../service/calcul-soap.service";
import {GraphQLRequestService} from "../../service/graph-qlrequest.service";
import {BorneService} from "../../service/borne.service";
import * as L from 'leaflet';
import 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-geometryutil';
import {tap} from "rxjs/operators";
import {Observable, zip} from "rxjs";

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
})
export class AccueilComponent implements OnInit {
  brands!: string[]; // liste des marques de voiture
  carList!: any[]; // liste des marques de voiture

  cities!: string[]; // liste des villes de départ
  citiesArrived!: string[]; // liste des villes d'arrivée
  carBrand!: string; // marque de la voiture
  startCity!: string; // ville de départ
  endCity!: string; // ville d'arrivée

  resultat!: number; // resultat du calcul

  coordinates: any[] = [];
  // MAP
  map: any; // map
  greenIcon = L.icon({
    iconUrl: 'assets/image/icons8-electric-power-64.png',
    iconSize: [20, 20], // size of the icon
    iconAnchor: [19, 19], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  constructor(private calculSoapService: CalculSoapService, private vehiculeService: GraphQLRequestService, private borneService: BorneService, private voitureService: GraphQLRequestService) {
  }

  ngOnInit() {
    this.map = L.map('map').setView([48.856614, 2.3522219], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(
      this.map
    );
  }

  // fonction qui permet de récupérer les informations  des marques de voiture
  onCarInput(event: any) {
    // add in this.brands test element
    // update search result
    this.brands = [];
    this.carList = [];

    this.vehiculeService.getCarInformaitonWithName(event.target.value).subscribe((data: any) => {
      this.carList = data;
      this.carList.forEach((car: any) => {
        this.brands.push(car.model + ' ' + car.make + ' autonomie ' + car.autonomy + ' km');
      });
    });
  }

  // fonction qui permet de récupérer les informations  des lieux de départ et d'arrivée
  onUserInput(event: any, value: boolean) {
    //permet d'afficher les villes chercher
    // if (value) {
    //   this.borneService.getCities(event.target.value).subscribe((data: any) => {
    //     this.cities = data;
    //   });
    // } else {
    //   this.borneService.getCities(event.target.value).subscribe((data: any) => {
    //     this.citiesArrived = data;
    //   });
    // }
  }

  onSubmit(form: { valid: any; }) {
    if (form.valid) {
      // search in carList the carBrand id
      let carId = '';
      this.carList.forEach((car: any) => {
        if (car.model + ' ' + car.make + ' autonomie ' + car.autonomy + ' km' === this.carBrand) {
          carId = car.id;
        }
      });

      zip(
        this.borneService.getGeoCoding(this.startCity),
        this.borneService.getGeoCoding(this.endCity),
        this.vehiculeService.getCarInformationWithID(carId),
      ).pipe(
        tap(value => {
          const start = value[0];
          const dest = value[1];
          const currentCar = value[2];


          const waypoint1 = new L.LatLng(start.lat, start.lon);
          const waypoint2 = new L.LatLng(dest.lat, dest.lon);

          this.calculSoapService.getDistanceV2(start.lat, start.lon, dest.lat, dest.lon, 60, 30, currentCar.autonomy).subscribe((data: any) => {
            this.resultat = data;
          });

          this.firstTraceRoute([waypoint1, waypoint2], currentCar.autonomy);
        })
      ).subscribe();

    } else {
      console.log('Formulaire invalide');
    }
  };

  calculIndexArray(distanceKm: number, autonomy: number, lengthCoords: number) {
    if (autonomy < distanceKm) {
      const nbReloads = distanceKm / autonomy;
      let index = (autonomy * lengthCoords) / distanceKm;
      index = index - 400;
      if (index < 0)
        index = 0;
      index = Math.floor(index);

      // Tableau index
      let arrayIndex: any = [];
      for (let i = 1; i <= nbReloads + 1; i++) {
        arrayIndex.push(index * i);
      }
      return arrayIndex;
    }
    return null;
  }

  splitInput(input: string) {
    let codePostal = input.split(" ")[2];
    let country = input.split(" ")[1];
    let city = input.split(" ")[0];
    return [city, country, codePostal];
  }

  private firstTraceRoute(waypoints: L.LatLng[], autonomy: number) {
    const routing = L.Routing.control({
      waypoints: waypoints
    }).addTo(this.map);

    routing.on('routesfound', (e) => {
      const distanceKm = e.routes[0].summary.totalDistance / 1000;
      const coords = e.routes[0].coordinates;
      const autonomyKm = autonomy;

      // we calcul when we need electric power
      let index = this.calculIndexArray(distanceKm, autonomyKm, coords.length);

      // if we need it on the road
      if (index != null) {
        const observables: Observable<any>[] = [];

        // for each, we want to find the nearest charging point
        index.forEach((p: number) => {
          if (coords[p]) {
            // we add all the query in an array to send them at the same time
            observables.push(this.borneService.getBorne(coords[p].lat, coords[p].lng, 100000));
          }
        });

        // send all the query
        zip(...observables).pipe(
          tap(value => {
            // we create a new route form start to dest passing through charging point
            const newWaypoints: any[] = [];
            newWaypoints.push(waypoints[0]);

            value.forEach(v => {
              newWaypoints.push(new L.LatLng(v.fields.ylatitude, v.fields.xlongitude))
            });

            newWaypoints.push(waypoints[1]);

            // trace new route and delete old route
            this.secondTraceRoute(newWaypoints, routing);
          })
        ).subscribe();
      }
    });
  }

  private secondTraceRoute(waypoints: L.LatLng[], routeToRemove: any) {
    // trace new route
    const routing = L.Routing.control({
      waypoints: waypoints
    }).addTo(this.map);

    // delete old route
    this.map.removeControl(routeToRemove);

    routing.on('routesfound', (e) => {
      const distanceKm = e.routes[0].summary.totalDistance / 1000;

      console.log('distanceKm : ' + distanceKm);
    })
  }
}

