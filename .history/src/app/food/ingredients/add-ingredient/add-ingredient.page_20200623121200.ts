import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl} from '@angular/forms';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { Ingredient } from 'src/app/models/ingredient.model';
import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';
//import { Camera } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';


const { Camera, Filesystem, Storage } = Plugins;

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
  photo: any;                                                 //fICHIER PHOTO
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
    //private camera: Camera,
    private webview: WebView,
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
      allowEditing: true,
      correctOrientation: true,
    });

    this.photoShow = capturedPhoto.webPath;
  }

  async openGalery() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      quality: 80,
      allowEditing: true,
      correctOrientation: true,
    });

    this.photoShow = capturedPhoto.webPath;
  }

/*   openGallery () {
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      allowEdit: true,
      quality: 80,
      encodingType: this.camera.EncodingType.JPEG,      
      correctOrientation: true
    }
    
    this.camera.getPicture(cameraOptions)
      .then((file_uri) => {
        this.photoFileUri = file_uri;
        this.photoShow = this.webview.convertFileSrc(file_uri);
      },
      (err) => {console.log(err)}
    );
  }

  takePhoto(){
    let cameraOptions = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      allowEdit: true,
      quality: 80,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    }
    
    this.camera.getPicture(cameraOptions)
      .then((image) => {
        /* this.photoShow = 'data:image/jpeg;base64,' + image;
        this.photoFile = image; 
      },
      (err) => {console.log(err)}
    );
  }

  onUploadFile(){
    this.photoIsUploading = true;
    this.ingredientsService.uploadFile(this.photoFile).then(
      (url: string) => {
        this.photoUploadedUrl = url;
        this.photoIsUploading = false;
        this.photoUploaded = true;
      }
    );

     this.file.resolveLocalFilesystemUrl(this.photoFileUri)
      .then(entry => {
          (entry as FileEntry).file(file => this.readFile(file))
      })
      .catch(err => {
          alert('Error while reading file.');
      });
  }

  readFile(file: any){
    const reader = new FileReader();
    reader.onload = () => {
        const imgBlob = new Blob([reader.result], {
            type: file.type
        });
        this.startUpload(imgBlob);
    };
    reader.readAsArrayBuffer(file);
  }

  startUpload(photo: Blob){
    this.photoIsUploading = true;
    this.ingredientsService.uploadFile(photo).then(
      (url: string) => {
        this.photoUploadedUrl = url;
        this.photoIsUploading = false;
        this.photoUploaded = true;
      }
    );
  } */

  onAddIngredient() {
    //this.onUploadFile();

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
