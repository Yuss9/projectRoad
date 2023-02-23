import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CaculSoapService {
  constructor(private http: HttpClient) {}

  getPageDataFromSoap(): Observable<any> {
    const url = 'http://localhost:8000';
    const options = { responseType: 'xml' as 'json' };

    const soapData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:spy="mon_app_serveur.soap">
    <soapenv:Header/>
    <soapenv:Body>
        <spy:calculer_temps_trajet>
            <spy:distance_km>10</spy:distance_km>
            <spy:vitesse_km_h>1</spy:vitesse_km_h>
            <spy:autonomie_km>5</spy:autonomie_km>
            <spy:temps_recharge_h>1</spy:temps_recharge_h>
        </spy:calculer_temps_trajet>
    </soapenv:Body>
</soapenv:Envelope>`;
    return this.http.post(url, soapData, options);
  }
}
