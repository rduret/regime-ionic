import { Injectable } from '@angular/core';
import { Measure } from '../models/measure.model';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;




@Injectable({
  providedIn: 'root'
})
export class WeightService {

  goalSubject = new Subject<number>();
  measures: Measure[];
  measuresSubject = new Subject<Measure[]>();

  constructor(private authService: AuthService) { 
    this.getMeasures();
  }

  //////////////////FONCTIONS////////////////////

  emitMeasures(){
    if(this.measures != undefined)
    {
      this.measures.sort(this.compareMeasuresByDateAsc);         //On tri le tableau par date puis on l'envoie
      this.calculateLostWeight();
      this.calculateAverageLostWeight();
      this.measuresSubject.next(this.measures);
    }
  }

  clearMeasures(){
    this.measures = []
  }

  //Fonction pour comparer deux dates de deux mesures
  compareMeasuresByDateAsc(a: Measure, b: Measure){
  let dateA: Date = new Date(a['date']),  dateB: Date = new Date(b['date']);
    if(dateA < dateB)
      return -1;
    if(dateA > dateB)
      return 1;
    return 0;
  }

  compareMeasuresByDateDesc(a: Measure, b: Measure){
    let dateA: Date = new Date(a['date']);
    let dateB: Date = new Date(b['date']);
      if(dateA > dateB)
        return -1;
      if(dateA < dateB)
        return 1;
      return 0;
    }

    compareMeasuresByDateAsc(a: Measure, b: Measure){
      let dateA: Date = new Date(a['date']);
      let dateB: Date = new Date(b['date']);
        if(dateA > dateB)
          return 1;
        if(dateA < dateB)
          return -1;
        return 0;
      }

  //Sauvegarder les mesures dans la BDD
  saveMeasures(){
    firebase.database().ref('/users/' + this.authService.getUserId() + '/measures').set(this.measures);
  }

  //Récupérer les mesures depuis la BDD
  getMeasures(){
    firebase.database().ref('/users/' + this.authService.getUserId() + '/measures')
        .on('value', (data: DataSnapshot) => {
          this.measures = data.val() ? data.val() : [];
          this.emitMeasures();
          }
        );
  }

  //Ajoute une mesure au tableau local et l'enregistre en BDD
  addMeasure(measure: Measure){
    this.measures.push(measure);
    this.saveMeasures();
    this.emitMeasures();
  }

  editMeasure(measure: Measure, newMeasure: Measure){
    this.removeMeasure(measure);
    this.addMeasure(newMeasure);
    this.saveMeasures();
    this.emitMeasures();
  }

  //Supprime une mesure
  removeMeasure(measure: Measure){
    const measureIndexToRemove = this.measures.findIndex(
      (measureEl) => {
        if(measureEl === measure) {
          return true;
        }
      }
    );
    this.measures.splice(measureIndexToRemove, 1);
    this.saveMeasures();
    this.emitMeasures();
  }

  //Calcul la masse perdue depuis la dernière mesure
  calculateLostWeight(){
    this.measures.forEach((measure, index) => {
      if(index == 0) 
        measure['lostWeight'] = 0;
      if(index > 0)
      {
        let lostWeight = measure['weight'] - this.measures[index-1]['weight'];
        measure['lostWeight'] = parseFloat(lostWeight.toFixed(2));
      }
    })
  }

  calculateAverageLostWeight(){
    let nbrOfMeasures = this.measures.length - 1;
    let sumOfLostWeight = 0;
    let average: number = 0;

    if(this.measures.length > 1){
      this.measures.forEach((measure, i) => {
        if(i > 0) //Pas de masse perdue pour le 1er
        {
          sumOfLostWeight += measure['lostWeight'];
        }
      });
      average = sumOfLostWeight / nbrOfMeasures;
    }

    return average.toFixed(2);
  }

  calculateTotalLostWeight(){
    let total: number = 0;
    if(this.measures.length > 0)
      total = this.measures[this.measures.length - 1]['weight'] - this.measures[0]['weight'];
    return total.toFixed(2);
  }

  daysSinceBeginning(){
    if(this.measures.length > 0)
    {
      let d1 = new Date(this.measures[0]['date']);
      let diff = Date.now() - d1.getTime();
      return Math.ceil(diff/(1000*60*60*24));
    }
    else return 0;
  }

  transformDateToString(date: Date){
    let year: string = date.getFullYear().toString();

    //getMonth() renvoie un nombre entre 0 et 11, il faut rajouter 1
    let month: number = date.getMonth()+1;
    let monthToString: string = ("0" + month.toString()).slice(-2);
    let day: string = ("0" + date.getDate().toString()).slice(-2);
    let dateString: string = year.concat('-', monthToString,'-', day);
    return dateString;
  }
}
