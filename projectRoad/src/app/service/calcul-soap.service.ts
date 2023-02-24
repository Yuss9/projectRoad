import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CalculSoapService {
  constructor(private http: HttpClient) {}

  getPageDataFromSoap(distanceKM : number,vitesse_km_h: number,temps_recharge_h: number, autonomie_km:number  ): Observable<any> {
    const url = 'http://localhost:8000';
    const options = { responseType: 'xml' as 'json' };

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

    // return this.http.post(url, soapData, options).pipe((data) => {
    //   console.log(data);

    // });

    return this.http.post<any>(url, soapData, options).pipe(
      tap((value) => console.log(value)),

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
