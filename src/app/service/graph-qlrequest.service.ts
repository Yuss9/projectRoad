import {Injectable} from '@angular/core';
import {Apollo, ApolloBase, gql} from 'apollo-angular';
import {map} from "rxjs/operators";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class GraphQLRequestService {

  ListCars: any;
  listCarsFiltered: any[] = [];
  private apollo: ApolloBase;

  constructor(private apolloProvider: Apollo) {
    this.apollo = this.apolloProvider.use('chargetrip');
    this.getCarInformations();
  }


//vehicleList(size: 1, search: "${carID}") {


  getCarInformationWithID(carID: string): Observable<any> {
    console.log("l'id du vehicule recu est  : ", carID)
    return this.apollo.watchQuery({
      query: gql`
        query vehicle {
          vehicle(id: "${carID}") {
             id
            naming {
              make
              model
              version
              edition
              chargetrip_version
            }
            battery {
              usable_kwh
              full_kwh
              }
            range {
              chargetrip_range {
                best
                worst
              }
            }
            media {
              image {
                thumbnail_url
                thumbnail_height
                thumbnail_width
              }
            }
          }
        }
        `,
    }).valueChanges.pipe(
      map((value: any) => {

        const id = value.data.vehicle.id;
        const make = value.data.vehicle.naming.make;
        const model = value.data.vehicle.naming.model;
        const version = value.data.vehicle.naming.version;
        const usable_kwh = value.data.vehicle.battery.usable_kwh;
        const full_kwh = value.data.vehicle.battery.full_kwh;
        const best = value.data.vehicle.range.chargetrip_range.best;
        const worst = value.data.vehicle.range.chargetrip_range.worst;
        const autonomy = (best + worst) / 2;
        const thumbnail_url = value.data.vehicle.media.image.thumbnail_url;
        return {id, make, model, version, usable_kwh, full_kwh, autonomy, thumbnail_url};
      })
    );
  }


  getCarInformaitonWithName(carModel: string): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`
       query vehicleListAll {
          vehicleList(size: 2, search: "${carModel}") {
            id
            naming {
              model
              make
            }
            range {
              chargetrip_range {
                best
                worst
              }
            }
          }
        }`
    }).valueChanges.pipe(
      map((value: any) => {

        // print name of car
        let data = value.data.vehicleList;
        let carName: any[] = [];
        for (let i = 0; i < data.length; i++) {
          let id = data[i].id;
          let model = data[i].naming.model
          let make = data[i].naming.make

          let autonomy = (data[i].range.chargetrip_range.best + data[i].range.chargetrip_range.worst) / 2;

          carName.push({id, model, make, autonomy});
        }
        return carName;
      })
    );
  }

  getCarInformations(): any {
    return this.apollo.watchQuery({
      query: gql`
        {
           vehicleList(
            page: 0,
            size: 2
          ) {
            id
            naming {
              make
              model
              version
              edition
              chargetrip_version
            }
            connectors{
              time
            }
            battery {
              usable_kwh
              full_kwh
              }
             range {
              chargetrip_range {
                best
                worst
              }
            }
            media {
              image {
                thumbnail_url
                thumbnail_height
                thumbnail_width
              }
            }
          }
        }
      `,
    }).valueChanges.pipe(
      map((value: any) => {
        this.ListCars = value.data.vehicleList;
        // filterred in variable
        for (let i = 0; i < this.ListCars.length; i++) {
          let battery = this.ListCars[i].battery;
          let connectors = this.ListCars[i].connectors;
          let imagURL = this.ListCars[i].media.image.thumbnail_url;
          let naming = this.ListCars[i].naming;
          let rangeMoy = (this.ListCars[i].range.chargetrip_range.best + this.ListCars[i].range.chargetrip_range.worst) / 2;
          // add to listcarsFiltered
          let car = {
            battery: battery,
            connectors: connectors,
            imagURL: imagURL,
            naming: naming,
            range: rangeMoy
          }
          this.listCarsFiltered.push(car);
        }
      }),
    ).subscribe();
  }


}
