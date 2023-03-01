import {Component, OnInit} from '@angular/core';
import {CalculSoapService} from "../../service/calcul-soap.service";
import {GraphQLRequestService} from "../../service/graph-qlrequest.service";
import {BorneService} from "../../service/borne.service";
import * as L from 'leaflet';
import 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-geometryutil';
import {catchError, filter, Observable, repeatWhen, take} from "rxjs";
import {tap} from "rxjs/operators";

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
  brands: string[] = ['Tesla', "BMW", "Mercedes"];
  cities!: string[]; // liste des villes de départ
  citiesArrived!: string[]; // liste des villes d'arrivée
  distance_km!: number;
  carBrand!: string; // marque de la voiture
  startCity!: string; // ville de départ
  endCity!: string; // ville d'arrivée
  vitesse_km_h!: number;
  autonomie_km!: number;
  temps_recharge_h!: number;

  resultat!: number; // resultat du calcul


  lat1!: number;
  lon1!: number;
  lat2!: number;
  lon2!: number;


  latBornes!: number;
  lonBornes!: number;
  lengthCoords!: number;

  coordinates: any[] = [];
  CurrentBorne!: any;


  allPlugs: any[] = []
  // MAP
  map: any; // map
  greenIcon = L.icon({
    iconUrl: 'assets/image/icons8-electric-power-64.png',
    iconSize: [20, 20], // size of the icon
    iconAnchor: [19, 19], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  constructor(private calculSoapService: CalculSoapService, private vehiculeService: GraphQLRequestService, private borneService: BorneService) {
  }

  ngOnInit() {
    this.map = L.map('map').setView([48.856614, 2.3522219], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(
      this.map
    );
  }

  onUserInput(event: any, value: boolean) {
    // permet d'afficher les villes chercher
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
      let startcity = this.splitInput(this.startCity);
      let endcity = this.splitInput(this.endCity);

      this.borneService.getLongLatOfCity(startcity[0], startcity[1], startcity[2]).subscribe((data: any) => {
        this.lat1 = data.lat;
        this.lon1 = data.lon;
        const marker = L.marker([this.lat1, this.lon1]).addTo(this.map);
        marker.bindPopup('Départ: ' + this.startCity).openPopup();
      });

      this.borneService.getLongLatOfCity(endcity[0], endcity[1], endcity[2],).subscribe((data: any) => {
        this.lat2 = data.lat;
        this.lon2 = data.lon;
        const marker = L.marker([this.lat2, this.lon2]).addTo(this.map);
        marker.bindPopup('Arrivée: ' + this.endCity).openPopup();
        this.map.panTo(new L.LatLng(this.lat2, this.lon2));
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(this.lat1, this.lon1),
            L.latLng(this.lat2, this.lon2),
          ],
          routeWhileDragging: true,
          showAlternatives: false,
        }).addTo(this.map);
        routingControl.on('routesfound', async (e: any) => {
          const routes = e.routes;
          const distance = routes[0].summary.totalDistance;
          const distanceKm = distance / 1000;
          const duration = routes[0].summary.totalTime;

          this.coordinates = routes[0].coordinates;
          this.lengthCoords = routes[0].coordinates.length;
          let autonomie = 5;
          let radius = 10000;
          let arrayIndex = this.calculIndexArray(distanceKm, autonomie, this.lengthCoords);
          let nbReloads = 0;

          if (arrayIndex !== null) {
            nbReloads = arrayIndex.length;
          }

          let observables: Observable<any> [] = [];
          let arrayWaypoints: any = []
          arrayWaypoints.push(L.latLng(this.lat1, this.lon1));
          routingControl.setWaypoints(arrayWaypoints).addTo(this.map);

          if (arrayIndex !== null) {
            for (let i = 0; i < nbReloads; i++) {
              radius = 10000;
              let index = arrayIndex[i];
              let lat = this.coordinates[index].lat;
              let lon = this.coordinates[index].lng;

              let obs: any = this.borneService.getPlugsNearCoordinateSecure(lat, lon, radius)
                .pipe(
                  repeatWhen(() => obs.pipe(
                    filter(data => data !== null),
                    take(1),
                  )),
                  tap((data: any) => {
                    this.CurrentBorne = data;
                  }),
                  catchError(error => {
                    radius *= 5;
                    return this.borneService.getPlugsNearCoordinateSecure(lat, lon, radius);
                  })
                );

              obs.subscribe((data: any) => {
                observables.push(data);
                arrayWaypoints.push(L.latLng(data.latitude, data.longitude));
                const marker = L.marker([data.latitude, data.longitude]).addTo(this.map);
                marker.bindPopup(data.name).openPopup();
                routingControl.setWaypoints(arrayWaypoints).addTo(this.map);
              });
            }// fin for

          }
          arrayWaypoints.push(L.latLng(this.lat2, this.lon2));
          routingControl.setWaypoints(arrayWaypoints).addTo(this.map);
        });
      });
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
}

