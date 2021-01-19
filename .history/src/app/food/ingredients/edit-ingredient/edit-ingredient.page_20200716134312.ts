import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, Form, ValidatorFn, AbstractControl} from '@angular/forms';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { Ingredient } from 'src/app/models/ingredient.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { Camera } from '@ionic-native/camera/ngx';

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
  
  constructor(
    private ingredientsService: IngredientsService, 
    private route: ActivatedRoute, 
    private router: Router,
    private toastController:  ToastController,
    private alertController: AlertController,
    private camera: Camera,
    ) { }

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
      this.checkIngredientValidator(this.listIngredients, this.ingredient)
    ])

    this.unitFormControl = new FormControl(this.ingredient.unit == '' ? 'Aucune' :  this.ingredient.unit, [
      Validators.required
    ])

    this.numberUnitFormControl = new FormControl(1, [
      Validators.required,
      Validators.pattern('^[+]?([0-9]+(?:[\\.][0-9]*)?|\\.[0-9]+)$')
    ])

    this.pointsFormControl = new FormControl(this.roundPoints(this.ingredient.ratio), [
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

  async onEditIngredient(){
    //Récupération des infos
    let name: string = this.editIngredientForm.get('name').value.toLocaleLowerCase().trim();
    name = name[0].toUpperCase() + name.slice(1);

    let unit = this.editIngredientForm.get('unit').value;
    if(unit == 'Aucune')
      unit  = '';

    let numberUnit = this.editIngredientForm.get('numberUnit').value;
    let points = this.editIngredientForm.get('points').value;
    let ratio = points/numberUnit;

    //Suppression de l'ancien ingrédient
    this.ingredientsService.deleteOnlyIngredient(this.ingredient);

    //Upload photo si nouvelle photo (!= de la toque + != de celle de l'ingrédient récupéré)
    if(this.photoShow != this.photoUrlDefault && this.photoShow != this.ingredient.photoUrl)
    {
      this.photoIsUploading = true;
      try {
        await this.ingredientsService.uploadPhoto(this.photoShow, name).then(
          (url: string) => {
            this.photoUploadedUrl = url;
            this.photoIsUploading = false;
            this.photoUploaded = true;
          }
        );
      }
      catch(e){console.log(e)}
      this.ingredientsService.deletePhoto(this.ingredient.photoUrl);        //On supprime l'ancienne 
    }
    else
      this.photoUploadedUrl = this.photoShow;       //On garde l'ancienne photo
      
    //Création et sauvegarde du nouvel ingrédient
    let newIngredient = new Ingredient(name, unit, ratio, this.photoUploadedUrl);
    this.ingredientsService.addIngredient(newIngredient);

    this.router.navigate(['alimentation/ingredients']);
    this.presentEditToast(name);
  }

  getIngredientByName(){
    let name = this.route.snapshot.params['name'];
    const ingredient = this.listIngredients.find(
      (s) => {
        return s.name === name;
      }
    );
    if(ingredient) return ingredient;
    else this.router.navigate(['/alimentation/ingredients']);
  }

  //Créer l'alerte pour confirmer la supression des ingrédients
  async presentAlertConfirm(){
    const alert = await this.alertController.create({
      cssClass: 'alertConfirm',
      header: 'Confirmer la suppression',
      message: "Êtes vous sûr de vouloir supprimer l'ingrédient '" + this.ingredient.name + "' ?" ,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Supprimer',
          handler: () => {
            this.ingredientsService.deleteIngredient(this.ingredient);
            this.router.navigate(['alimentation/ingredients']);
            this.presentDeleteToast(this.ingredient.name);
          }
        }
      ]
    });
    await alert.present();
  }
  
  async presentEditToast(name: string){
    const toast = await this.toastController.create({
      message: name + 'a été modifié !',
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
  }

  async presentDeleteToast(name: string){
    const toast = await this.toastController.create({
      message: name + ' a été supprimé !',
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
  }

  checkIngredientValidator(listIngredients: Ingredient[], editedIngredient: Ingredient): ValidatorFn{            
    return (ingredientName: AbstractControl): {[key: string]: boolean} | null => {

      if(ingredientName.value != null)
      {
        let newIngredientName = ingredientName.value.toLocaleLowerCase().trim();
        let currentIngredientName = editedIngredient.name.toLocaleLowerCase().trim();
        let identical:Boolean = false;
        
        if(listIngredients)
        {
          listIngredients.forEach(function(ingredient){
            if(newIngredientName == ingredient.name.toLocaleLowerCase().trim() && newIngredientName !== currentIngredientName)        //Si l'ingrédient du tab a le même nom que celui tapé dans l'input 
            {                                                                                                                  //&& si l'ingrédient tapé n'est pas le même que l'ingrédient modifié
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

  //Arrondi le nombre de points au centième
  roundPoints(points: number){
    return Math.round(points*100)/100;
  }  
}
