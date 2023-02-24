import {Component, OnInit} from '@angular/core';
import {CalculSoapService} from "../../service/calcul-soap.service";
import {GraphQLRequestService} from "../../service/graph-qlrequest.service";

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
})
export class AccueilComponent implements OnInit {
  brands: string[] = ['Tesla', "BMW", "Mercedes"];
  cities: string[] = ['Aix-les-Bains', "Terrain de basket", "Chambery"];
  distance_km!: number;
  carBrand!: string;
  startCity!: string;
  endCity!: string;
  vitesse_km_h!: number;
  autonomie_km!: number;
  temps_recharge_h!: number;

  resultat!: number;

  constructor(private calculSoapService: CalculSoapService, private vehiculeService: GraphQLRequestService) {
  }

  ngOnInit() {
  }

  onSubmit(form: { valid: any; }) {
    if (form.valid) {
      console.log('Formulaire valide');
      console.log(this.distance_km);
      // Appeler le service SOAP avec les valeurs de distance, vitesse et autonomie
    } else {
      console.log('Formulaire invalide');
    }
  }
}
