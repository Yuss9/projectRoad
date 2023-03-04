import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CalculSoapService {
  constructor(private http: HttpClient) {
  }

  getDistanceV2(lat1: number, lon1: number, lat2: number, lon2: number, vitesse_km_h: number, temps_recharge_min: number, autonomie_km: number) {
    const url = 'http://localhost:8000';
    const options = {responseType: 'xml' as 'json'};

    const SoapData = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:spy="mon_app_serveur.soap">
      <soapenv:Header/>
      <soapenv:Body>
        <spy:calculer_temps_trajetV2>
            <spy:vitesse_moyenne>${vitesse_km_h}</spy:vitesse_moyenne>
            <spy:lat1>${lat1}</spy:lat1>
            <spy:lon1>${lon1}</spy:lon1>
            <spy:lat2>${lat2}</spy:lat2>
            <spy:lon2>${lon2}</spy:lon2>
            <spy:autonomie>${autonomie_km}</spy:autonomie>
            <spy:temps_recharge_min>${temps_recharge_min}</spy:temps_recharge_min>
        </spy:calculer_temps_trajetV2>
      </soapenv:Body>
    </soapenv:Envelope>`;

    return this.http.post<any>(url, SoapData, options).pipe(
      map(value => {
        let res = value
          .split("<tns:calculer_temps_trajetV2Result>")[1]
          .split("</tns:calculer_temps_trajetV2Result>")[0];
        let hours = Math.floor(res);
        let minutes = Math.round((res - hours) * 60);
        res = `${hours}h${minutes}`;
        return res;
      })
    );
  }

  getPageDataFromSoap(distanceKM: number, vitesse_km_h: number, temps_recharge_h: number, autonomie_km: number): Observable<any> {
    const url = 'http://localhost:8000';
    const options = {responseType: 'xml' as 'json'};

    const soapData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:spy="mon_app_serveur.soap">
    <soapenv:Header/>
    <soapenv:Body>
        <spy:calculer_temps_trajet>
            <spy:distance_km> ${distanceKM} </spy:distance_km>
            <spy:vitesse_km_h>${vitesse_km_h}</spy:vitesse_km_h>
            <spy:autonomie_km>${autonomie_km}</spy:autonomie_km>
            <spy:temps_recharge_h>${temps_recharge_h}</spy:temps_recharge_h>
        </spy:calculer_temps_trajet>
    </soapenv:Body>
</soapenv:Envelope>`;


    return this.http.post<any>(url, soapData, options).pipe(
      map((value: string) => {
        const data = value.split('calculer_temps_trajetResult');
        let res = data[1];
        res = res.replace('>', '');
        res = res.replace('</tns:', '');
        return res;
      })
    );
  }
}
