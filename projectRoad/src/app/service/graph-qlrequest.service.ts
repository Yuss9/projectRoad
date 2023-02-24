import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class GraphQLRequestService {

  vehicleListQuery = `
query vehicleList($page: Int, $size: Int, $search: String) {
  vehicleList(
    page: $page,
    size: $size,
    search: $search,
  ) {
    id
    naming {
      make
      model
      chargetrip_version
    }
    media {
      image {
        thumbnail_url
      }
    }
  }
}
    `;

  constructor(private http: HttpClient) {
  }
}
