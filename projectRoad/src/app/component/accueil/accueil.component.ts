import {Component, OnInit} from '@angular/core';
import {CalculSoapService} from "../../service/calcul-soap.service";
import {GraphQLRequestService} from "../../service/graph-qlrequest.service";
import {BorneService} from "../../service/borne.service";
import * as L from "leaflet";

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
})
export class AccueilComponent implements OnInit {
  brands: string[] = ['Tesla', "BMW", "Mercedes"];
  cities!: string[];
  citiesArrived!: string[];
  distance_km!: number;
  carBrand!: string;
  startCity!: string;
  endCity!: string;
  vitesse_km_h!: number;
  autonomie_km!: number;
  temps_recharge_h!: number;

  resultat!: number;


  // MAP
  map: any;
  greenIcon = L.icon({
    iconUrl: 'assets/image/icons8-electric-power-64.png',
    iconSize: [38, 38], // size of the icon
    iconAnchor: [19, 19], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  constructor(private calculSoapService: CalculSoapService, private vehiculeService: GraphQLRequestService, private borneService: BorneService) {
  }

  ngOnInit() {
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
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
      console.log(this.startCity);
      console.log(this.endCity);
      let codePostal = this.startCity.split(" ")[2];
      let country = this.startCity.split(" ")[1];
      let city = this.startCity.split(" ")[0];


      let codePostalArrived = this.endCity.split(" ")[2];
      let countryArrived = this.endCity.split(" ")[1];
      let cityArrived = this.endCity.split(" ")[0];


      this.borneService.getLongLatOfCity(city, country, codePostal).subscribe((data: any) => {
        let lat = data.lat;
        let long = data.lon;
        this.addMarker(lat, long);
      });

      this.borneService.getLongLatOfCity(cityArrived, countryArrived, codePostalArrived).subscribe((data: any) => {
        let lat = data.lat;
        let long = data.lon;
        this.addMarker(lat, long);
      });

      // Appeler le service SOAP avec les valeurs de distance, vitesse et autonomie
    } else {
      console.log('Formulaire invalide');
    }
  }


  addMarker(lat: number, long: number) {
    console.log("addMarker")
    //this.map.setView(new L.LatLng(lat, long), {animation: true});
    L.marker([lat, long], {icon: this.greenIcon}).addTo(this.map);
  }
}
