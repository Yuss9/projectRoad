import {Component, OnInit} from '@angular/core';
import {CalculSoapService} from './service/calcul-soap.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'projectRoad';

  constructor(private calculSoapService: CalculSoapService) {
  }

  ngOnInit() {

  }
}
