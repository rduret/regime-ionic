import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, Form, ValidatorFn, AbstractControl} from '@angular/forms';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { Ingredient } from 'src/app/models/ingredient.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-ingredient',
  templateUrl: './edit-ingredient.page.html',
  styleUrls: ['./edit-ingredient.page.scss'],
})
export class EditIngredientPage implements OnInit {

  ingredient: Ingredient;  //Ingrédient modifié 

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
  
  constructor(private ingredientsService: IngredientsService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.listIngredients = this.route.snapshot.data.ingredients;
    this.ingredient = this.getIngredientByName();
    this.photoShow = this.ingredient.photoUrl;

    this.unitsSubscription = this.ingredientsService.listUnitsSubject.subscribe(
      (units: String[]) => {
        this.units = units;
        this.listIngredientsSubscription = this.ingredientsService.listIngredientsSubject.subscribe(
          (ingredients: Ingredient[]) => {
            this.listIngredients = ingredients;
            this.initForm();
          })
    })
    this.ingredientsService.emitUnits();
    this.ingredientsService.emitIngredients();
  }

  ngOnDestroy(){
    this.unitsSubscription.unsubscribe();
    this.listIngredientsSubscription.unsubscribe();
  }

  initForm(){
    this.nameFormControl = new FormControl(this.ingredient.name, [
      Validators.required,
      this.checkIngredientValidator(this.listIngredients)
    ])

    this.unitFormControl = new FormControl(this.ingredient.unit, [
      Validators.required
    ])

    this.numberUnitFormControl = new FormControl(1, [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ])

    this.pointsFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ])

    this.editIngredientForm = new FormGroup({
      name: this.nameFormControl,
      unit: this.unitFormControl,
      numberUnit: this.numberUnitFormControl,
      points: this.pointsFormControl
    })
  }

  onEditIngredient() {
    let name: string = this.editIngredientForm.get('name').value.toLocaleLowerCase();
    name = name[0].toUpperCase() + name.slice(1)

    let unit = this.editIngredientForm.get('unit').value;
    if(unit == 'Aucune')
      unit  = '';

    let numberUnit = this.editIngredientForm.get('numberUnit').value;
    let points = this.editIngredientForm.get('points').value;
    let ratio = points/numberUnit;;

    let newIngredient = new Ingredient(name, unit, ratio);

    if(this.photoUploadedUrl && this.photoUploadedUrl !== '') 
      newIngredient.photoUrl = this.photoUploadedUrl;
    else
      newIngredient.photoUrl = this.photoUrlDefault;

    this.ingredientsService.deleteIngredient(this.ingredient);  
    this.ingredientsService.addIngredient(newIngredient);
    this.router.navigate(['alimentation/ingredients']);
  }

  getIngredientByName() {
    let name = this.route.snapshot.params['name'];
    const recipe = this.listIngredients.find(
      (s) => {
        return s.name === name;
      }
    );
    if(recipe) return recipe;
    else this.router.navigate(['/alimentation/recettes']);
  }

  //CUSTOM VALIDATOR 
  checkIngredientValidator(listIngredients: Ingredient[]): ValidatorFn{            
    return (ingredientName: AbstractControl): {[key: string]: boolean} | null => {

      if(ingredientName.value != null)
      {
        let ingredientNameLowerCase = ingredientName.value.toLowerCase();
        let identical:Boolean = false;
        
        if(listIngredients)
        {
          listIngredients.forEach(function(ingredient){
            if(ingredient.name.toLocaleLowerCase() == ingredientNameLowerCase)
            {
              identical = true;
            }
          });
        }

        if(identical)
          return { 'alreadyCreated' : true };
        else
          return null;
      }
    }
  }
}
