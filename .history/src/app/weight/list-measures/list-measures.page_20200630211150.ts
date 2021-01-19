import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { WeightService } from '../../services/weight.service';
import { Measure } from '../../models/measure.model';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm, AbstractControl, ValidatorFn, } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ErrorStateMatcher } from '@angular/material/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-list-measures',
  templateUrl: './list-measures.page.html',
  styleUrls: ['./list-measures.page.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  //encapsulation: ViewEncapsulation.None,
})
export class ListMeasuresPage implements OnInit {

 //add form
 weightFormControl: FormControl;
 dateFormControl: FormControl;

 //edit form
 dateEditFormControl: FormControl;
 weightEditFormControl: FormControl;
 editedDateValue: string;                                //La date actuelle de la mesure que l'on modifie
 matcher = new MyErrorStateMatcher();
 maxDate = new Date();
 myFilter = (d: Date): boolean => {
   if(this.isDateFree(d))
     return true;
   else
     return false;
 }
 myFilterEdit;

 lengthPaginator = 0;

 info: string = '';
 listMeasures: Measure[];
 measuresSubscription: Subscription;
 addMeasureForm: FormGroup;
 editMeasureForm: FormGroup;
 columnsToDisplay = ['date', 'weight', 'lostWeight', 'actions'];
 dataSource: MatTableDataSource<Measure>;

 @ViewChild(MatPaginator, {read: false, static: true}) paginator: MatPaginator;
 @ViewChild(IonInfiniteScroll, {read: false, static: true}) infiniteScroll: IonInfiniteScroll;


 constructor(private weightService: WeightService, private formBuilder: FormBuilder, private route: ActivatedRoute) {  }

 ngOnInit(){
    //Voir resolver pour data.measures
    this.listMeasures = this.route.snapshot.data.measures;
    this.listMeasures.sort(this.weightService.compareMeasuresByDateDesc);
    this.initForms();
 
    //Connexion au subject du tableau des mesures et maj en cas de modif 
    this.measuresSubscription = this.weightService.measuresSubject.subscribe(
      (measures: Measure[]) => {
        this.listMeasures = measures;
        this.listMeasures.sort(this.weightService.compareMeasuresByDateDesc); 
        this.dataSource = new MatTableDataSource(this.listMeasures);
        this.dataSource.paginator = this.paginator;
        this.initForms(); 
      }
    );
  }
 
  ionViewWillEnter() {
    this.dataSource = new MatTableDataSource(this.listMeasures);
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(){
    if (this.dataSource) { this.dataSource.disconnect(); }
    this.measuresSubscription.unsubscribe();
  }
 

    //////////////////////////  PAGINATOR ////////////////////////////
  //Charge les données dans le paginator
  async loadData() {
    if (this.lengthPaginator < this.listMeasures.length)   //Si il reste des ingrédients on augmente le nombre d'el de la page
    {
      await this.wait(1000);
      this.infiniteScroll.complete();
      this.appendItems(10)
    } 
    else 
      this.infiniteScroll.disabled = true;
  }

  appendItems(number) {
    this.paginator._changePageSize(this.paginator.pageSize + number);
    
    //Si on a tout paginé
    if(this.paginator.pageSize >= this.listMeasures.length)
      this.infiniteScroll.disabled = true;
  }

  wait(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  initForms(){
    this.weightFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ]);
 
    this.dateFormControl = new FormControl(new Date(), [
      Validators.required,
      this.dateFreeValidator(this.listMeasures)
    ]);
 
    this.weightEditFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ]);
 
    this.dateEditFormControl = new FormControl(new Date(), [
      Validators.required,
      this.dateFreeEditValidator(this.listMeasures, this.editedDateValue)
    ]);
 
    this.addMeasureForm = new FormGroup({
      weight: this.weightFormControl,
      date: this.dateFormControl 
    })
 
    this.editMeasureForm = new FormGroup({
      weight: this.weightEditFormControl,
      date: this.dateEditFormControl 
    })
  }
 
  addMeasure(){
    let weight = this.addMeasureForm.get('weight').value;
    let date = this.addMeasureForm.get('date').value;
    let dateString = this.weightService.transformDateToString(date);
    this.weightService.addMeasure(new Measure(weight, dateString));
  }
 
 
  editMeasure(measure: Measure){
    let weight = this.editMeasureForm.get('weight').value;
    let date = this.editMeasureForm.get('date').value;
    let dateString = this.weightService.transformDateToString(date);
    this.weightService.editMeasure(measure, new Measure(weight, dateString));
  }
 
  deleteMeasure(measure: Measure){
    this.weightService.removeMeasure(measure);
  }
 
  updateEditMeasureForm(){
    this.myFilterEdit = (d: Date): boolean => {
      if(this.isDateFreeEdit(d, this.editedDateValue))
        return true;
      else
        return false;
    }
    
    this.weightEditFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ]);
 
    this.dateEditFormControl = new FormControl(new Date(this.editedDateValue), [
      Validators.required,
      this.dateFreeEditValidator(this.listMeasures, this.editedDateValue)
    ]);
 
    this.editMeasureForm = new FormGroup({
      weight: this.weightEditFormControl,
      date: this.dateEditFormControl 
    })
  }
 
  openEditForm(newEditedDate: string){
    this.editedDateValue = newEditedDate;
    this.updateEditMeasureForm();
  }
 
  closeEditForm(){
    this.editMeasureForm.reset();
  }
 
  dateFreeValidator(listMeasures: Measure[]): ValidatorFn{
    return (date: AbstractControl): {[key: string]: boolean} | null => {
 
      let dateString = this.weightService.transformDateToString(date.value);
      let isDateFree: Boolean = true;
      listMeasures.forEach(function(measure){
 
        if(measure['date'] == dateString)   //Si utilisée
          {
              isDateFree = false;
          }
       })
 
      //Transformation date us -> eu
      let dateEu = new Date(date.value);
      let year: string = dateEu.getFullYear().toString();
      let month: number = dateEu.getMonth()+1;
      let monthToString: string = ("0" + month.toString()).slice(-2);
      let day: string = ("0" + dateEu.getDate().toString()).slice(-2);
      let dateEuString: string = monthToString.concat('/', day,'/', year);
 
      if(new Date() < new Date(dateEuString)) //Si dans le futur
        isDateFree = false;
 
      if (isDateFree)
        return null;
      else
        return { 'dateFree': true };
    };
  }
 
  dateFreeEditValidator(listMeasures: Measure[], editedDateValue: string): ValidatorFn{            
    return (date: AbstractControl): {[key: string]: boolean} | null => {
    
      if(date.value != null && editedDateValue != undefined)
      {
      let dateString = this.weightService.transformDateToString(date.value);
      let isDateFree: Boolean = true;
      listMeasures.forEach(function(measure){
        if(measure['date'] == dateString && dateString != editedDateValue)   //Si utilisée dans une AUTRE mesure
              isDateFree = false;
       })
 
      //Transformation date us -> eu
      let dateEu = new Date(date.value);
      let year: string = dateEu.getFullYear().toString();
      let month: number = dateEu.getMonth()+1;
      let monthToString: string = ("0" + month.toString()).slice(-2);
      let day: string = ("0" + dateEu.getDate().toString()).slice(-2);
      let dateEuString: string = monthToString.concat('/', day,'/', year);
 
      if(new Date() < new Date(dateEuString)) //Si dans le futur
        isDateFree = false;
 
      if (isDateFree)
        return null;
      else
        return { 'dateFree': true };
    };
    }
  }
 
  isDateFree(date: Date){
    let dateString = this.weightService.transformDateToString(date);
    let isDateFree: Boolean = true;
    this.listMeasures.forEach(function(measure){
        if(measure['date'] == dateString)   //Si utilisée
          {
              isDateFree = false;
          }
       })
    return isDateFree;
  }
 
 
  isDateFreeEdit(date: Date, editedDateValue){
    if(editedDateValue != undefined)
    {
      let dateString = this.weightService.transformDateToString(date);
      let isDateFree: Boolean = true;
      this.listMeasures.forEach(function(measure){
          if(measure['date'] == dateString && dateString != editedDateValue)   //Si utilisée dans une AUTRE mesure
            {
                isDateFree = false;
            }
        })
      return isDateFree;
    }
  }
 
  getColor(value){
    let lostWeight = Number(value);
    if(lostWeight < -0.3)
      return '#2add3c';
    else if((lostWeight < 0) && (lostWeight >= -0.3))
      return 'orange';
    else
      return 'red';
   }
}
