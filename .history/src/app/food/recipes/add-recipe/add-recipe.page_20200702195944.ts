import { Component, OnInit } from '@angular/core';
import { Recipe } from 'src/app/models/recipe.model';
import { RecipesService } from 'src/app/services/recipes.service';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, FormBuilder, FormArray, NgForm } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { FileValidator } from 'ngx-material-file-input';
import { Ingredient } from 'src/app/models/ingredient.model';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.page.html',
  styleUrls: ['./add-recipe.page.scss'],
})
export class AddRecipePage implements OnInit {

  listRecipes: Recipe[];
  listRecipesSubscription: Subscription;

  listIngredients: Ingredient[];
  listIngredientsSubscription: Subscription;
  

  //Forms
  addRecipeForm: FormGroup;
  nameFormControl: FormControl;
  peoplesFormControl: FormControl;
  listIngredientsFormArray: FormArray = new FormArray([], Validators.required);
  maxIngredients: number = 20;

  confirmation: String;

  addIngredientForm: FormGroup;
  ingredientNameFormControl: FormControl;
  ingredientQuantityFormControl: FormControl;
  filteredIngredients: Observable<Ingredient[]>;
  currentIngrUnit: String = '';
  totalPoints: number = 0;
  

  //Uploading file
  photoIsUploading = false;
  photoUrlDefault = "assets/img/default.png";
  photoUrl: string = this.photoUrlDefault;
  photoUploaded = false;

  constructor(private recipesService: RecipesService, private ingredientService: IngredientsService, private formBuilder: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit() { 
    //Récupération des listes des ingrédients et des recettes via les resolvers
    this.listIngredients = this.route.snapshot.data.ingredients;
    this.listRecipes = this.route.snapshot.data.recipes;

    //Connexion aux Observers
    this.listRecipesSubscription = this.recipesService.listRecipesSubject.subscribe(
      (recipes: Recipe[]) => {
        this.listRecipes = recipes;
        this.listIngredientsSubscription = this.ingredientService.listIngredientsSubject.subscribe(
          (ingredients: Ingredient[]) => {
            this.listIngredients = ingredients;
            this.initForms();
          })  
      })

    this.recipesService.emitRecipes();
    this.ingredientService.emitIngredients();
  }

  ngOnDestroy(){
    this.listRecipesSubscription.unsubscribe();
    this.listIngredientsSubscription.unsubscribe();
    
    //Si la photo est différent de celle par default on supprime car c'est que la photo n'est pas utilisée
    if(this.photoUrl != this.photoUrlDefault)
      this.recipesService.deletePhoto(this.photoUrl);
  }

  _filterIngredient(value: string): Ingredient[] {
    const filterValue = value.toLowerCase();
    return this.listIngredients.filter(ingredient => ingredient.name.toLowerCase().indexOf(filterValue) === 0);
  }

  initForms(){
    this.nameFormControl = new FormControl('', [
      Validators.required,
      this.checkRecipeValidator(this.listRecipes)
    ])

    this.photoFormControl = new FormControl('', [
      FileValidator.maxContentSize(this.maxSizePhoto)
    ])

    this.peoplesFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ])

    this.addRecipeForm = new FormGroup({
      name: this.nameFormControl,
      photo: this.photoFormControl,
      peoples: this.peoplesFormControl,
      ingredients: this.listIngredientsFormArray
    })

    this.ingredientNameFormControl = new FormControl('', [
      Validators.required,
      this.isIngredientAddedValidator(),
      this.isIngredientExistValidator()
    ])

    this.ingredientNameFormControl.valueChanges.subscribe(ingredientName => {
      this.checkIngredientUnit(ingredientName);
    })

    this.ingredientQuantityFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ])

    this.addIngredientForm = new FormGroup({
      ingredientName: this.ingredientNameFormControl,
      ingredientQuantity: this.ingredientQuantityFormControl
    })

    this.filteredIngredients = this.ingredientNameFormControl.valueChanges
    .pipe(
      startWith(''),
      map(ingredient => ingredient ? this._filterIngredient(ingredient) : this.listIngredients)
    );
  }
  
  onAddRecipe(){
    let name = this.addRecipeForm.get('name').value.toLocaleLowerCase().trim();
    name = name[0].toUpperCase() + name.slice(1)
    let listIngredients = this.addRecipeForm.get('ingredients').value ? this.addRecipeForm.get('ingredients').value : [];
    let peoples = this.addRecipeForm.get('peoples').value
    let newRecipe = new Recipe(name, listIngredients, this.totalPoints, peoples)

    if(this.photoUrl && this.photoUrl !== '') 
      newRecipe.photoUrl = this.photoUrl;
    else
      newRecipe.photoUrl = this.photoUrlDefault;

    this.recipesService.addRecipe(newRecipe);

    this.reinitializeForms();
    this.photoUrl = this.photoUrlDefault;
    this.confirmation = name + " a été rejouté à la liste !";
  }
 

  onAddIngredient(){
    let nameIngredient = this.addIngredientForm.get('ingredientName').value.trim();
    let quantityIngredient = this.addIngredientForm.get('ingredientQuantity').value;
    let ingredientToAdd: Ingredient;
    
    this.listIngredients.forEach((ingredient) => {
      if(ingredient.name == nameIngredient)
        ingredientToAdd = ingredient;
    })

    ingredientToAdd.quantity = quantityIngredient;
    ingredientToAdd.points = quantityIngredient*ingredientToAdd.ratio;
    ingredientToAdd.points = Math.round(ingredientToAdd.points*100) / 100;    //On arrondi les points à deux chiffres après la virgule
    
    this.listIngredientsFormArray.push(new FormControl(ingredientToAdd));
    this.listIngredientsFormArray.updateValueAndValidity();

    this.ingredientNameFormControl.setValue('');
    this.ingredientNameFormControl.markAsUntouched();
    this.ingredientQuantityFormControl.setValue('');
    this.ingredientQuantityFormControl.markAsUntouched();
    this.updateTotal();
  }

  onDeleteIngredient(ingredient){
    let ingredientIndexToRemove = this.listIngredientsFormArray.controls.findIndex(
      (ingredientEl) => {
        if(ingredientEl === ingredient) {
          return true;
        }
      }
    );

    this.listIngredientsFormArray.controls.splice(ingredientIndexToRemove, 1);
    this.listIngredientsFormArray.updateValueAndValidity();
    this.updateTotal();
  }

  reinitializeForms(){

    this.nameFormControl.setValue('');    //recipe name
    this.nameFormControl.markAsUntouched();

    this.photoFormControl.setValue('');   //recipe photo
    this.photoFormControl.markAsUntouched();

    this.listIngredientsFormArray.controls.splice(0, this.listIngredientsFormArray.controls.length);
    this.listIngredientsFormArray.updateValueAndValidity();
    this.updateTotal();
  }

  updateTotal(){
    let total = 0;
    this.listIngredientsFormArray.value.forEach((ingredient) => {
      total += ingredient.points;
    })
    this.totalPoints = total;
  }

  checkIngredientUnit(ingredientName: string){
    let ingredientNameLowerCase = ingredientName.toLocaleLowerCase().trim();
    let isPresent: boolean = false;

    this.listIngredients.forEach((ingredient) => {
      if(ingredient.name.toLocaleLowerCase() == ingredientNameLowerCase && ingredient.unit != '')
        {
          isPresent = true;
          this.currentIngrUnit = '(' + ingredient.unit + ')';
        }
      }); 
    
    if(!isPresent)
      this.currentIngrUnit = '';
  }

  detectFiles(event) {
    if(!this.photoFormControl.invalid && this.photoFormControl.value != undefined)
      this.onUploadFile(event.target.files[0]);
  }

  onUploadFile(file: File) {
    this.photoIsUploading = true;
    this.recipesService.uploadFile(file).then(
      (url: string) => {
        this.photoUrl = url;
        this.photoIsUploading = false;
        this.photoUploaded = true;
      }
    );
  }

  roundPoints(points){ return Math.round(points*100)/100; }

  //CUSTOM VALIDATORS

  //Vérifie que la recette n'existe pas déjà 
  checkRecipeValidator(listRecipes: Recipe[]): ValidatorFn{            
    return (recipeName: AbstractControl): {[key: string]: boolean} | null => {

      if(recipeName.value != null)
      {
        let recipeNameLowerCase = recipeName.value.toLowerCase().trim();
        let identical:Boolean = false;
        
        if(listRecipes)
        {
          listRecipes.forEach(function(recipe){
            if(recipe.name.toLocaleLowerCase().trim() == recipeNameLowerCase)
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

  //Vérifie que l'ingrédient n'a pas déjà été ajouté à la recette actuelle
  isIngredientAddedValidator(): ValidatorFn{            
    return (ingredientName: AbstractControl): {[key: string]: boolean} | null => {

      if(ingredientName.value != null)
      {
        let ingredientNameLowerCase = ingredientName.value.toLowerCase().trim();
        let identical:Boolean = false;

        if(this.listIngredientsFormArray.value)
        {
          this.listIngredientsFormArray.value.forEach(function(ingredient){
            if(ingredient.name.toLocaleLowerCase().trim() == ingredientNameLowerCase)
            {
              identical = true;
            }
          });  
        }

        if(identical)
          return { 'alreadyAdded' : true };
        else
          return null;
      }
    }
  }

  //Vérifie que l'ingrédient existe bien dans la base de donnée
  isIngredientExistValidator(): ValidatorFn{            
    return (ingredientName: AbstractControl): {[key: string]: boolean} | null => {

      if(ingredientName.value != null)
      {
        let ingredientNameLowerCase = ingredientName.value.toLowerCase().trim();
        let identical:Boolean = false;

        if(this.listIngredients)
        {
          this.listIngredients.forEach(function(ingredient){
            if(ingredient.name.toLocaleLowerCase().trim() == ingredientNameLowerCase)
            {
              identical = true;
            }
          });  
        }

        if(!identical)
          return { 'ingredientNotFound' : true };
        else
          return null;
      }
    }
  }
}
