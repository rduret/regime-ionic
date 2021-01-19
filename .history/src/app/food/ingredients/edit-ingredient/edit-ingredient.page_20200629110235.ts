import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, Form, ValidatorFn, AbstractControl} from '@angular/forms';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { Ingredient } from 'src/app/models/ingredient.model';
import { FileValidator } from 'ngx-material-file-input';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-ingredient',
  templateUrl: './edit-ingredient.page.html',
  styleUrls: ['./edit-ingredient.page.scss'],
})
export class EditIngredientPage implements OnInit {

  ingredient: Ingredient;  //Ingrédient mofifié 

  //ARRAYS AND SUBSCRIPTIONS  
  //Liste de tous les ingrédients
  listIngredients: Ingredient[];
  listIngredientsSubscription: Subscription;

  //Liste des unités
  units: String[];
  unitsSubscription: Subscription;

  //FORM
  editIngredientForm: FormGroup;
  nameFormControl: FormControl;
  unitFormControl: FormControl;
  numberUnitFormControl: FormControl;
  pointsFormControl: FormControl;
  confirmation: String;

  //UPLOAD FILE
  photoUrlDefault = "assets/img/default.png"                  //Adresse par défaut  
  photoShow: string = this.photoUrlDefault;                   //Adresse de la photo à montrer
  photoUploadedUrl: string = this.photoUrlDefault;            //Url de la photo stockée sur firebase
  photoIsUploading = false;
  photoUploaded = false;
  
  constructor() { }

  ngOnInit() {
  }

}
