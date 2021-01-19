import { Component, OnInit } from '@angular/core';
import { Recipe } from 'src/app/models/recipe.model';
import { RecipesService } from 'src/app/services/recipes.service';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, FormBuilder, FormArray, NgForm } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, startWith} from 'rxjs/operators';
import { Ingredient } from 'src/app/models/ingredient.model';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.page.html',
  styleUrls: ['./edit-recipe.page.scss'],
})
export class EditRecipePage implements OnInit {

  //Recette actuellement modifiée
  recipe: Recipe;

  //ARRAYS ET SUBSCRIPTIONS
  listRecipes: Recipe[];
  listRecipesSubscription: Subscription;

  listIngredients: Ingredient[];
  listIngredientsSubscription: Subscription;

  //FORMS
  editRecipeForm: FormGroup;
  nameFormControl: FormControl;
  peoplesFormControl: FormControl;
  listIngredientsFormArray: FormArray = new FormArray([], Validators.required);
  maxIngredients: number = 20;

  addIngredientForm: FormGroup;
  ingredientNameFormControl: FormControl;
  ingredientQuantityFormControl: FormControl;
  filteredIngredients: Observable<Ingredient[]>;
  currentIngrUnit: String = 'Quantité';
  totalPoints: number;
  
  //FICHIERS D'UPLOAD
  photoUrlDefault = "assets/img/default.png";
  photoShow: string = this.photoUrlDefault;                   //Adresse de la photo à montrer
  photoUploadedUrl: string = this.photoUrlDefault;            //Url de la photo stockée sur firebase
  photoUploaded = false;
  photoIsUploading = false;


  constructor(private recipesService: RecipesService,
    private ingredientService: IngredientsService,
    private route: ActivatedRoute,
    private camera: Camera,
    private router: Router,
    private toastController: ToastController) { }

  ngOnInit() { 
    //Voir resolvers pour data.recipes
    this.listRecipes = this.route.snapshot.data.recipes;
    this.listIngredients = this.route.snapshot.data.ingredients;
    this.recipe = this.getRecipeByName();
    this.photoShow = this.recipe.photoUrl;
    this.totalPoints = this.recipe.points;

    //On lie les données locales à l'observer
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
  }

  //On récupère la recette sélectionnée grâce à l'url 
  getRecipeByName(){
    let name = this.route.snapshot.params['name'].trim();
    const recipe = this.listRecipes.find(
      (s) => {
        return s.name === name;
      }
    );
    if(recipe) return recipe;
    else this.router.navigate(['/alimentation/recettes']);
  }

  initForms(){
    this.nameFormControl = new FormControl(this.recipe.name, [
      Validators.required,
      this.checkRecipeValidator(this.listRecipes, this.recipe)
    ])

    this.peoplesFormControl = new FormControl(this.recipe.peoples, [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ])

    this.editRecipeForm = new FormGroup({
      name: this.nameFormControl,
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
    

    //Pour chaque ingredient dans this.recipe.listIngredients, push un new control dans this.listIngredientsFormArray
    this.recipe.listIngredients.forEach((ingredient) => {
      this.listIngredientsFormArray.push(new FormControl(ingredient))
    });

    this.filteredIngredients = this.ingredientNameFormControl.valueChanges
    .pipe(
      startWith(''),
      map(ingredient => ingredient ? this._filterIngredient(ingredient) : this.listIngredients.slice())
    );
  }

  //Prendre une photo
  async takePhoto() {
    this.camera.getPicture({
      quality: 100,
      allowEdit: true,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA
    }).then((imageData) => {
      this.photoShow = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      console.log(err);
    })
  }

  //Sélectionner une photo sur l'appareil
  async selectPhoto() {
    this.camera.getPicture({
      quality: 100,
      allowEdit: true,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }).then((imageData) => {
      this.photoShow = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      console.log(err);
    })
  }

  //Permet de filtrer les ingrédients avec une chaine de caractères
  _filterIngredient(value: string): Ingredient[] {
    const filterValue = value.toLowerCase();
    return this.listIngredients.filter(ingredient => ingredient.name.toLowerCase().indexOf(filterValue) === 0);
  }
  
  //Ajoute un ingrédient dans la recette
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

  //Supprime un ingrédient de la recette
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

  //Modifie la recette en supprimant l'ancienne puis en rajoutant une nouvelle
  async onEditRecipe(){
    //Récupération des infos
    let name = this.editRecipeForm.get('name').value.trim();
    name = name[0].toUpperCase() + name.slice(1)
    
    let listIngredients = this.editRecipeForm.get('ingredients').value ? this.editRecipeForm.get('ingredients').value : [];
    let peoples = this.editRecipeForm.get('peoples').value

    //Suppression de l'ancienne recette
    this.recipesService.deleteOnlyRecipe(this.recipe);

    //Upload photo si nouvelle photo (!= de la toque + != de celle de la recette récupérée)
    if(this.photoShow != this.photoUrlDefault && this.photoShow != this.recipe.photoUrl)
    {
      this.photoIsUploading = true;
      try {
        await this.recipesService.uploadPhoto(this.photoShow, name).then(
          (url: string) => {
            this.photoUploadedUrl = url;
            this.photoIsUploading = false;
            this.photoUploaded = true;
          }
        );
      }
      catch(e){console.log(e)}
      this.recipesService.deletePhoto(this.recipe.photoUrl);        //On supprime l'ancienne 
    }
    else
      this.photoUploadedUrl = this.photoShow;       //On garde l'ancienne photo

    //Création et sauvegarde de la nouvelle recette
    let newRecipe = new Recipe(name, listIngredients, this.totalPoints, peoples, this.photoUploadedUrl);  
    this.recipesService.addRecipe(newRecipe);
    this.recipe = newRecipe;
    this.presentToast(this.recipe.name);
    this.router.navigate(['alimentation/recettes/'])
  }

  /*************************************************** FONCTIONS SECONDAIRES ***************************************************/

  //Toast pour indiquer la modification de la recette
  async presentToast(name: string){
    const toast = await this.toastController.create({
      message: name + ' a été modifié !',
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
  }

  //Met à jour le nombre de points que contient la recette
  updateTotal(){
    let total = 0;
    this.listIngredientsFormArray.value.forEach((ingredient) => {
      total += ingredient.points;
    })
    this.totalPoints = total;
  }

  //Remplace à la volée l'unité dans l'input des quantités
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
      this.currentIngrUnit = 'Quantité';
  }

  //Arrondi au centième
  roundPoints(points){ return Math.round(points*100)/100; }

  //CUSTOM VALIDATORS
  //Vérifie que la recette n'existe pas déjà hormis celle modifiée
  checkRecipeValidator(listRecipes: Recipe[], editedRecipe: Recipe): ValidatorFn{            
    return (recipeName: AbstractControl): {[key: string]: boolean} | null => {

      if(recipeName.value != null)
      {
        let recipeNameLowerCase = recipeName.value.toLowerCase().trim();
        let editedRecipeNameLowerCase = editedRecipe.name.toLocaleLowerCase().trim();
        let identical:Boolean = false;
        
        if(listRecipes)
        {
          listRecipes.forEach(function(recipe){
            if((recipe.name.toLocaleLowerCase().trim() == recipeNameLowerCase) && (editedRecipeNameLowerCase != recipeNameLowerCase))
              identical = true;
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
              identical = true;
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
