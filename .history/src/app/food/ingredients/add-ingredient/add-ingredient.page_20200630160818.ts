import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { Ingredient } from 'src/app/models/ingredient.model';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { Camera } from '@ionic-native/camera/ngx';


@Component({
  selector: 'app-add-ingredient',
  templateUrl: './add-ingredient.page.html',
  styleUrls: ['./add-ingredient.page.scss'],
})
export class AddIngredientPage implements OnInit {

  //ARRAYS AND SUBSCRIPTIONS
  listIngredients: Ingredient[];
  listIngredientsSubscription: Subscription;

  units: String[];
  unitsSubscription: Subscription;

  //FORM
  addIngredientForm: FormGroup;
  nameFormControl: FormControl;
  photoFormControl: FormControl;
  unitFormControl: FormControl;
  numberUnitFormControl: FormControl;
  pointsFormControl: FormControl;

  //UPLOAD FILE
  photoUrlDefault = "assets/img/default.png"                  //Adresse par défaut  
  photoShow: string = this.photoUrlDefault;                   //Adresse de la photo à montrer
  photoUploadedUrl: string = this.photoUrlDefault;            //Url de la photo stockée sur firebase
  photoIsUploading = false;
  photoUploaded = false;

  constructor(
    private ingredientsService: IngredientsService,
    private toastController:  ToastController,
    private camera: Camera,
    ) { }


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

  async onAddIngredient() {
    let name: string = this.addIngredientForm.get('name').value.toLocaleLowerCase().trim();
    name = name[0].toUpperCase() + name.slice(1)

    let unit = this.addIngredientForm.get('unit').value;
    if(unit == 'Aucune')
      unit  = '';

    let numberUnit = this.addIngredientForm.get('numberUnit').value;
    let points = this.addIngredientForm.get('points').value;
    let ratio = points/numberUnit;;


    //upload photo
    if(this.photoShow !== this.photoUrlDefault)
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
    }

    let newIngredient = new Ingredient(name, unit, ratio);

    if(this.photoUploadedUrl && this.photoUploadedUrl !== '') 
      newIngredient.photoUrl = this.photoUploadedUrl;
    else
      newIngredient.photoUrl = this.photoUrlDefault;

    //AJOUTER GESTION ERREUR
    this.ingredientsService.addIngredient(newIngredient);
    this.presentToast(name);

    this.photoShow = this.photoUrlDefault;
    this.photoUploadedUrl = '';
  }

  async presentToast(name: string) {
    const toast = await this.toastController.create({
      message: name + 'a été ajouté à la liste !',
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
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
