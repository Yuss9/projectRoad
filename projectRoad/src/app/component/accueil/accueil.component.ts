import {Component, OnInit} from '@angular/core';
import {CalculSoapService} from "../../service/calcul-soap.service";
import {GraphQLRequestService} from "../../service/graph-qlrequest.service";
import {BorneService} from "../../service/borne.service";

import * as L from 'leaflet';
import 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-geometryutil';

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

    this.borneService.getNearbyChargingStationsWithAutonomy("48.8520930694", "2.34738897685", "100").subscribe((data: any) => {
      console.log(data);
    });
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
        console.log('lat1: ', this.lat1);
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
            // je calcule a partir de mon pt de depart la distance en km donc 100km apres (1 er arret)
            // j'envoi a l'api la lat et lon de ce point
            // je recupere la lat et lon de ce point
            // place les bornes les plus proche et ajoute sur la map
            // je calcule a partir de ce point la distance en km donc 100km apres (2 eme arret)
            L.latLng(this.lat2, this.lon2),
          ],
          routeWhileDragging: true,
          showAlternatives: false,
        }).addTo(this.map);

        //I need to get the geojson from the routing control
        //and then use it to get the distance
        //and then use it to get the duration
        //and then use it to get the number of plugs needed

        routingControl.on('routesfound', (e: any) => {
          const routes = e.routes;
          const distance = routes[0].summary.totalDistance;
          const distanceKm = distance / 1000;
          const duration = routes[0].summary.totalTime;

          this.lengthCoords = routes[0].coordinates.length;
          const autonomy = 100;
          let index = (autonomy * this.lengthCoords) / distanceKm;
          index = index - 400;
          index = Math.floor(index);
          console.log("index", index - 400);

          this.latBornes = routes[0].coordinates[index].lat;
          this.lonBornes = routes[0].coordinates[index].lng;

          routingControl.setWaypoints([
            L.latLng(this.lat1, this.lon1),
            L.latLng(this.latBornes, this.lonBornes),
            L.latLng(this.lat2, this.lon2),
          ]).addTo(this.map);

          // const plugsNeeded = this.calculatePlugsNeeded(distance, duration);
          //this.soapCalcul.calculDuration(duration, this.lat1, this.lon1, this.lat2, this.lon2, this.autonomie, this.tempsRechargeMin).pipe(
          console.log('distance: ', distance);
          console.log('duration: ', duration);
          // console.log('plugsNeeded: ', plugsNeeded);
          console.log('routes', routes[0])
        });
      });
      // Appeler le service SOAP avec les valeurs de distance, vitesse et autonomie
    } else {
      console.log('Formulaire invalide');
    }
  }

  splitInput(input: string) {
    let codePostal = input.split(" ")[2];
    let country = input.split(" ")[1];
    let city = input.split(" ")[0];
    return [city, country, codePostal];
  }
}
