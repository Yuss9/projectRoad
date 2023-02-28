import {Component, OnInit} from '@angular/core';
import * as L from "leaflet";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  // create map
  map: any;
  greenIcon = L.icon({
    iconUrl: 'assets/image/icons8-electric-power-64.png',
    iconSize: [38, 38], // size of the icon
    iconAnchor: [19, 19], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  constructor() {
  }

  ngOnInit() {
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);

    // L.marker([51.5, -0.09]).addTo(map)
    //   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //   .openPopup();
    // L.control.scale().addTo(map);
    //L.marker([45.64046, 5.8714], {icon: greenIcon}).addTo(this.map);
  }

  addMarker(long: number, lat: number) {
    L.marker([long, lat], {icon: this.greenIcon}).addTo(this.map);
  }

}
