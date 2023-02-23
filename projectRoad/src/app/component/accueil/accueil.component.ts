import { Component } from '@angular/core';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
})
export class AccueilComponent {
  distance_km: number;
  vitesse_km_h: number;
  autonomie_km: number;

  constructor() {
    this.distance_km = 0;
    this.vitesse_km_h = 0;
    this.autonomie_km = 0;
  }
}
