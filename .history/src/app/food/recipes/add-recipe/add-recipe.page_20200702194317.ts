import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, Form, ValidatorFn, AbstractControl} from '@angular/forms';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { Ingredient } from 'src/app/models/ingredient.model';
import { FileValidator } from 'ngx-material-file-input';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.page.html',
  styleUrls: ['./add-recipe.page.scss'],
})
export class AddRecipePage implements OnInit {

 //ARRAYS AND SUBSCRIPTIONS
 listIngredients: Ingredient[];
 listIngredientsSubscription: Subscription;

 units: String[];
 unitsSubscription: Subscription;

 //FORM
 addIngredientForm: FormGroup;
 nameFormControl: FormControl;
 unitFormControl: FormControl;
 numberUnitFormControl: FormControl;
 pointsFormControl: FormControl;

 //UPLOAD FILE

 photoIsUploading = false;
 photoUrlDefault = "assets/img/default.png"
 photoUrl: string = this.photoUrlDefault;
 photoUploaded = false;


 constructor(private ingredientsService: IngredientsService) { }

 ngOnInit() {
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
   this.nameFormControl = new FormControl('', [
     Validators.required,
     this.checkIngredientValidator(this.listIngredients)
   ])

   this.unitFormControl = new FormControl('', [
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

   this.addIngredientForm = new FormGroup({
     name: this.nameFormControl,
     unit: this.unitFormControl,
     numberUnit: this.numberUnitFormControl,
     points: this.pointsFormControl
   })
 }

 onAddIngredient(){
   let name: string = this.addIngredientForm.get('name').value.toLocaleLowerCase().trim();
   name = name[0].toUpperCase() + name.slice(1);

   let unit = this.addIngredientForm.get('unit').value;
   if(unit == 'Aucune')
     unit  = '';

   let numberUnit = this.addIngredientForm.get('numberUnit').value;
   let points = this.addIngredientForm.get('points').value;
   let ratio = points/numberUnit;

   let newIngredient = new Ingredient(name, unit, ratio);

   if(this.photoUrl && this.photoUrl !== '') 
     newIngredient.photoUrl = this.photoUrl;
   else
     newIngredient.photoUrl = this.photoUrlDefault;

   this.ingredientsService.addIngredient(newIngredient);
   this.photoUrl = this.photoUrlDefault;
 }

 //CUSTOM VALIDATOR 
 checkIngredientValidator(listIngredients: Ingredient[]): ValidatorFn{            
   return (ingredientName: AbstractControl): {[key: string]: boolean} | null => {

     if(ingredientName.value != null)
     {
       let ingredientNameLowerCase = ingredientName.value.toLowerCase().trim();
       let identical:Boolean = false;
       
       if(listIngredients)
       {
         listIngredients.forEach(function(ingredient){
           if(ingredient.name.toLocaleLowerCase().trim() == ingredientNameLowerCase)
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
