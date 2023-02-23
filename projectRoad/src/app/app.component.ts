import { Component } from '@angular/core';
import { CaculSoapService } from './cacul-soap.service';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'projectRoad';

  // function parse string
  function parseString(str, tag) {
    let res = str.split(tag);
    res = res[1];
    res = res.replace('>', '');
    res = res.replace('</tns:', '');
    return res;
  }

  constructor(private caculSoapService: CaculSoapService) {}

  ngOnInit() {
    this.caculSoapService.getPageDataFromSoap().subscribe((data) => {
      console.log(data);
    });
  }
}

