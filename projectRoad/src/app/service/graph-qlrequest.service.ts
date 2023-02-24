import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class GraphQLRequestService {


  constructor() {
  }

  // getVehicleList(page: number, size: number = 10, search: string = ''): Observable<any> {
  //   const query = gql`
  //     query vehicleList($page: Int, $size: Int, $search: String) {
  //       vehicleList(page: $page, size: $size, search: $search) {
  //         id
  //         naming {
  //           make
  //           model
  //           chargetrip_version
  //         }
  //         media {
  //           image {
  //             thumbnail_url
  //           }
  //         }
  //       }
  //     }
  //   `;
  //
  //   return this.apollo.watchQuery({
  //     query: query,
  //     variables: {
  //       page: page,
  //       size: size,
  //       search: search
  //     }
  //   });
  //
  // }
}
