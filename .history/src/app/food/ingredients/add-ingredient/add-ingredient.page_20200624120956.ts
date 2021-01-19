import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { Ingredient } from 'src/app/models/ingredient.model';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';


const { Camera, Filesystem } = Plugins;

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
  photo: File;                                                //Fichier de la photo
  photoUri: string;                                           //Uri de la photo stockée sur le tel
  photoUrlDefault = "assets/img/default.png"                  //Adresse par défaut  
  photoShow: string = this.photoUrlDefault;                   //Adresse de la photo à montrer
  photoUploadedUrl: string = this.photoUrlDefault;            //Url de la photo stockée sur firebase
  photoIsUploading = false;
  photoUploaded = false;

  goal: number;

  constructor(
    private ingredientsService: IngredientsService,
    private toastController:  ToastController,
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
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 80,
      //allowEditing: true,
      correctOrientation: true,
    });

    this.photoUri = capturedPhoto.path;
    //this.photoShow = capturedPhoto.webPath;

    this.photo = new File([this.dataURItoBlob(this.photoUri)], 'nomIngredient', {type: "image/jpeg"}); 
    this.uploadPhoto(this.photo);
  }

  async openGallery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 80,
      //allowEditing: true,
      correctOrientation: true,
    });

    this.photoUri = capturedPhoto.path;
    this.photoShow = capturedPhoto.webPath;
  }


  async uploadPhoto(photo: File){
    this.photoIsUploading = true;

    try {
      this.ingredientsService.uploadFile(photo).then(
        (url: string) => {
          this.photoUploadedUrl = url;
          this.photoShow = url;
          this.photoIsUploading = false;
          this.photoUploaded = true;
        }
      );
    }
    catch(e){document.write(e)}
  }

  dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++){
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });    
   return blob;
  }

  onAddIngredient() {
    this.uploadPhoto(this.photo);

    let name: string = this.addIngredientForm.get('name').value.toLocaleLowerCase();
    name = name[0].toUpperCase() + name.slice(1)

    let unit = this.addIngredientForm.get('unit').value;
    if(unit == 'Aucune')
      unit  = '';

    let numberUnit = this.addIngredientForm.get('numberUnit').value;
    let points = this.addIngredientForm.get('points').value;
    let ratio = points/numberUnit;;

    let newIngredient = new Ingredient(name, unit, ratio);

    if(this.photoUploadedUrl && this.photoUploadedUrl !== '') 
      newIngredient.photoUrl = this.photoUploadedUrl;
    else
      newIngredient.photoUrl = this.photoUrlDefault;

    this.ingredientsService.addIngredient(newIngredient);
    this.presentToast(name);

    this.photoShow = this.photoUrlDefault;
    //this.photoFileUri = "";
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
