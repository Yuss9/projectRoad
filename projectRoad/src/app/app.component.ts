import { Component } from '@angular/core';
import { CalculSoapService } from './service/calcul-soap.service';
import { OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'projectRoad';
  constructor(private calculSoapService: CalculSoapService) {}

  ngOnInit() {
    this.caculSoapService
      .getPageDataFromSoap()
      .pipe(tap((value) => console.log(value)))
      .subscribe();
  }
}
