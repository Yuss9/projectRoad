import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AccueilComponent} from './component/accueil/accueil.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { GraphQLModule } from './graphql.module';


@NgModule({
  declarations: [AppComponent, AccueilComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, GraphQLModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
