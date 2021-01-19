import { Component, OnInit } from '@angular/core';
import { WeightService } from '../../services/weight.service';
import { Measure } from '../../models/measure.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';
import * as Chart from 'node_modules/chart.js'
import * as regression from 'regression';
import { ActivatedRoute } from '@angular/router';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { Location } from '@angular/common';

const { App } = Plugins;

@Component({
  selector: 'app-recap',
  templateUrl: './recap.page.html',
  styleUrls: ['./recap.page.scss'],
})
export class RecapPage implements OnInit {

  lastWeight: number;
  goal: number;
  rest: number;

  //Measures :
  listMeasures: Measure[];
  measuresSubscription: Subscription;


  //Data :
  daysSinceBeginning: number;
  averageDiffWeight: string = '0';
  totalWeight: string = '0';
  intervalDuration: number = 30;

  //Charts :
  chartWeight: Chart;
  chartLostWeight: Chart;
  weights: number[];
  lostWeights: number[];
  weightsRegression: any[];
  dates: string[];

  constructor(
    private weightService: WeightService, 
    private authService: AuthService, 
    private route: ActivatedRoute,
    private platform: Platform,
    private routerOutlet: IonRouterOutlet,
    private location: Location,
    ) { }


  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(5, () => {
/*       if(!this.routerOutlet.canGoBack())
        App.exitApp();
      else */
        this.location.back();               //BUG : quitte l'appli quand même
    });

    this.listMeasures = this.route.snapshot.data.measures;
    this.listMeasures.sort(this.weightService.compareMeasuresByDateAsc);
    this.getGoal();

    //Connexion au subject du tableau des mesures
    this.measuresSubscription = this.weightService.measuresSubject.subscribe(
      (measures: Measure[]) => {
        this.listMeasures = measures;
        this.listMeasures.sort(this.weightService.compareMeasuresByDateAsc); //MERDE
        if((this.listMeasures != undefined) && (this.listMeasures.length != 0))
          this.lastWeight = this.listMeasures[this.listMeasures.length - 1]['weight'];
        
        
        this.initCharts();
        this.displayDatas();
      }
    );
    this.weightService.emitMeasures();
  }

  ngOnDestroy(){
    this.measuresSubscription.unsubscribe();
    this.chartWeight.destroy();
    this.chartLostWeight.destroy();
  }

  displayDatas(){
    this.displayTotalWeight();
    this.displayDaysSinceBeginning();
    this.displayAverageDiffWeight();
  }

  getAverageLostWeight(){
    let average = Number(this.weightService.calculateAverageLostWeight());
    if(average > 0)
      return '+ ' + average;
    else
      return average;
  }

  getGoal(){
    firebase.database().ref('/users/' + this.authService.getUserId() + '/goal').once('value').then((snapshot) => {
     this.goal = snapshot.val();
     this.rest = this.lastWeight - this.goal;
    })
  }


  displayAverageDiffWeight(){
    let average = Number(this.weightService.calculateAverageLostWeight());
    let averageAbs = Math.abs(average);
    let progression = averageAbs / this.intervalDuration;
    let i = 0.0001;
    let interval = setInterval(
      () => {
        if(i <= averageAbs)
        {
          if(average < 0)
            this.averageDiffWeight = '-' + i.toFixed(1);
          else if(average > 0)
            this.averageDiffWeight = '+' + i.toFixed(1);
          else
            this.averageDiffWeight = i.toFixed(1);

          i += progression;
        }
        else
        {
          if(average > 0)
            this.averageDiffWeight = '+' + average.toFixed(1);
          else
            this.averageDiffWeight = average.toFixed(1);
          clearInterval(interval);
        }


      }, this.intervalDuration
    )
  }

  displayTotalWeight(){
    let total = Number(this.weightService.calculateTotalLostWeight());
    let totalAbs = Math.abs(total);
    let progression = totalAbs / this.intervalDuration;
    let i = 0.0001;
    let interval = setInterval(
      () => {
        if(i <= totalAbs)
        {
          if(total < 0)
            this.totalWeight = '-' + i.toFixed(1);
          else if(total > 0)
            this.totalWeight = '+' + i.toFixed(1);
          else
            this.totalWeight = i.toFixed(1);

          i += progression;
        }
        else
        {
          if(total > 0)
            this.totalWeight = '+' + total.toFixed(1);
          else
            this.totalWeight = total.toFixed(1);

          clearInterval(interval);
        }
      }, this.intervalDuration
    )
  }

  displayDaysSinceBeginning(){
    let daysSinceBeginning = this.weightService.daysSinceBeginning()
    let i = 0;
    let interval = setInterval(
      () => {
        if(i <= daysSinceBeginning)
        {
          this.daysSinceBeginning = i;
          i++;
        }
        else
          clearInterval(interval);
      }, this.intervalDuration / (daysSinceBeginning * 0.5)
    )
  }

  getRegression(data)   //Retourne un objet contenant l'équation de la courbe de tendance
  {
    let resultRegression = regression.linear(data);

    return resultRegression;
  };

  initCharts(){
    this.dates = [];
    this.weights = [];
    this.lostWeights = [];
    this.weightsRegression = [];
    this.listMeasures.forEach((measure, index) => {
      this.dates.push(measure['date']);
      this.weights.push(measure['weight']);
      this.lostWeights.push(measure['lostWeight']);
      this.weightsRegression.push([index, +measure['weight']]);
    });

    //On récupère la dernière date et on lui rajoute quelques semaines (3) pour l'affichage du graphique
    let lastDateString = this.dates[this.dates.length - 1];
    let lastDate = new Date (lastDateString);
    let maxAxeY = lastDate.setDate(lastDate.getDate()+21);

    //On s'occupe de la courbe de tendance d'équation y = mx+c
    let equation = this.getRegression(this.weightsRegression);
    let m: number = equation['equation'][0];
    let c: number = equation['equation'][1];

    //Pour prolonger la droite il nous faut un troisième point plus loin dans le temps (x2)
    let diffDate = Date.parse(lastDateString) - Date.parse(this.dates[0]);
    let fictUTCDate = Date.parse(lastDateString) + diffDate;
    let fictDate = new Date(fictUTCDate); //fictDate va nous servir à prolonger la droite

    this.chartWeight = new Chart('canvasWeight', {
      type: 'line',
      data: {
        labels: this.dates,
        datasets: [
          { 
            data: this.weights,
            label: 'Masse',
            borderColor: "#a22424",
            fill: false,
            pointRadius: 2
          },
          { 
            label: 'Prévision',
            data: [
              {
                t: this.dates[0],
                y: c
              },
              {
                t: new Date (lastDateString),
                y: m*(this.dates.length - 1) + c
              },
              {
                t: fictDate,
                y: (m*(this.dates.length - 1) + c) + (m*(this.dates.length - 1))
              }
            ],
            pointRadius: 0,
            tension: 0,
            borderColor: "#a2242487",
            borderDash: [20],
            fill: false
          }
        ]
      },
      options: {
        responsive : true,
        maintainAspectRatio: false,
        tooltips: {
          enabled: false
        },
        title: {
          display: true,
          text: 'Masse au fil des semaines',
          fontColor:  '#a22424de',
          fontSize: 17
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            time:{
              unit: 'week',
              distribution: 'linear',
              isoWeekda: true,
              stepSize: 1,
              tooltipFormat: 'DD/MM/YYYY',
              displayFormats: {
                week: 'DD/MM/YY'
              },
              ticks:{
                max: maxAxeY,
              }
            },
            gridLines: {
              display: true,
              zeroLineWidth: 0.5
            }
          }],
          yAxes: [{
            display: true,
             ticks: {
              stepSize: 2,
              suggestedMin: Math.min(...this.weights)-1,
              suggestedMax: Math.max(...this.weights)+1
            },
            scaleLabel: {
              display: true,
              labelString: 'Masse (kg)'
            },
          }],
        },
      }
    });

    this.chartLostWeight = new Chart('canvasLostWeight', {
      type: 'line',
      data: {
        labels: this.dates.slice(1),
        datasets: [
          { 
            data: this.lostWeights.slice(1),
            label: 'Différence de masse par semaine',
            borderColor: "#a22424",
            fill: false,
            lineTension	: 0.15,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive : true,
        maintainAspectRatio: false,
        tooltips: {
          enabled: false
        },
        title: {
          display: true,
          text: 'Prise ou perte de masse par semaine',
          fontColor:  '#a22424de',
          fontSize: 17
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            type: 'time',
            time:{
              unit: 'week',
              distribution: 'series',
              isoWeekda: true,
              tooltipFormat: 'DD/MM/YYYY',
              displayFormats: {
                week: 'DD/MM/YYYY'
              },
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Différence de masse (kg)'
            },
            ticks: {
              stepSize: 2
            }
          }],
        },
      },
    });
  }

  getColor(value){
    if(Number(value)<0)
      return 'green';
    else if(Number(value) == 0)
      return 'grey';
    else
      return 'red';
  }

}
