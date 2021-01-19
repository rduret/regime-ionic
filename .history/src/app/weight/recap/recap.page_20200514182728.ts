import { Component, OnInit } from '@angular/core';
import { WeightService } from '../../services/weight.service';
import { Measure } from '../../models/measure.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';
import * as Chart from 'node_modules/chart.js'
import * as regression from 'regression';

@Component({
  selector: 'app-recap',
  templateUrl: './recap.page.html',
  styleUrls: ['./recap.page.scss'],
})
export class RecapPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
