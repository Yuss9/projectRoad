import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AccueilComponent} from './component/accueil/accueil.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';
import {APOLLO_NAMED_OPTIONS, ApolloModule, NamedOptions} from "apollo-angular";
import {InMemoryCache} from "@apollo/client";
import {HttpLink} from "apollo-angular/http";

@NgModule({
  declarations: [AppComponent, AccueilComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, ApolloModule],
  providers: [
    {
      provide: APOLLO_NAMED_OPTIONS, // <-- Different from standard initialization
      useFactory(httpLink: HttpLink): NamedOptions {
        return {
          chargetrip: {
            // <-- This settings will be saved by name: chargetrip
            cache: new InMemoryCache(),
            link: httpLink.create({
              uri: 'https://api.chargetrip.io/graphql',
              headers: new HttpHeaders({
                'x-client-id': '63f936b48f03f15cd38e9a36',
                'x-app-id': '63f936b48f03f15cd38e9a38'
              }),
              method: 'POST'
            }),
          },
        };
      },
      deps: [HttpLink],
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
