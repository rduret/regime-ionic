import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Ingredient } from '../models/ingredient.model';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;

@Injectable({
  providedIn: 'root'
})
export class IngredientsService {

  listUnits: String[] = [];
  listUnitsSubject = new Subject<String[]>();


/*     'Aucune',
    'Poignée',
    'Petite Poignée',
    'Pincée',
    'Portion',
    'Part',
    'cc',
    'CS',
    'Tablette',
    'Feuille',
    'Morceau',
    'Sachet',
    'Tranche',
    'Petit',
    'Moyen',
    'Grand',
    'Bouteille',
    'Verre',
    'Canette',
    'Dose',
    'Tasse',
    'Bol',
    'mg',
    'g',
    'kg',
    'cl',
    'ml',
    'L' */

  listIngredients: Ingredient[];
  listIngredientsSubject = new Subject<Ingredient[]>();

  constructor() {
    this.getIngredients();
    this.getListUnits();
  }

  emitIngredients(){
    if(this.listIngredients != undefined){
      //Ordre alphabétique
      this.listIngredients.sort(function(a, b){
        let nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
        if (nameA < nameB) 
            return -1 
        if (nameA > nameB)
            return 1
        return 0
      });
    }
    this.listIngredientsSubject.next(this.listIngredients);
  }

  emitUnits(){
    this.listUnitsSubject.next(this.listUnits);
  }

  getIngredients(){
    firebase.database().ref('/food/ingredients')
    .on('value', (data: DataSnapshot) => {
      this.listIngredients = data.val() ? data.val() : [];
      this.emitIngredients();
      }
    );
  }

  getListUnits(){
    firebase.database().ref('/food/units')
    .on('value', (data: DataSnapshot) => {
      this.listUnits = data.val() ? data.val() : [];
      this.emitUnits();
      }
    );
  }

  saveIngredients(){
    firebase.database().ref('/food/ingredients').set(this.listIngredients);
  }

  saveUnits(){
    firebase.database().ref('/food/units').set(this.listUnits);
  }


  addIngredient(ingredient: Ingredient){
    this.listIngredients.push(ingredient);
    this.saveIngredients();
    this.emitIngredients();
  }

  addUnit(unit: string){
    this.listUnits.push(unit);
    this.saveUnits();
    this.emitUnits();
  }


  deletePhoto(url: string){
    firebase.storage().refFromURL(url).delete();
  }

  deleteIngredient(ingredient: Ingredient){
    if(ingredient.photoUrl != "" && ingredient.photoUrl != "assets/img/default.png") {

      const storageRef = firebase.storage().refFromURL(ingredient.photoUrl);
      storageRef.delete().then(
        () => {
          console.log('Photo removed!');
        },
        (error) => {
          console.log('Could not remove photo! : ' + error);
        });
      }


    const ingredientIndexToRemove = this.listIngredients.findIndex(
      (ingredientEl) => {
        if(ingredientEl === ingredient) {
          return true;
        }
      }
    );

    this.listIngredients.splice(ingredientIndexToRemove, 1);
    this.saveIngredients();
    this.emitIngredients();
  }

  
  deleteMultipleIngredients(ingredients: Ingredient []){
    ingredients.forEach(ingredient => {
      if(ingredient.photoUrl != "" && ingredient.photoUrl != "assets/img/default.png") {

        const storageRef = firebase.storage().refFromURL(ingredient.photoUrl);
        storageRef.delete().then(
          () => {
            console.log('Photo removed!');
          },
          (error) => {
            console.log('Could not remove photo! : ' + error);
          });
        }
  
  
      const ingredientIndexToRemove = this.listIngredients.findIndex(
        (ingredientEl) => {
          if(ingredientEl === ingredient) {
            return true;
          }
        }
      );
  
      this.listIngredients.splice(ingredientIndexToRemove, 1);
    })
    this.saveIngredients();
    this.emitIngredients();
  }

  deleteUnit(unit: String){
    const unitIndexToRemove = this.listUnits.findIndex(
      (unitEl) => {
        if(unitEl === unit) {
          return true;
        }
      }
    );
    this.listUnits.splice(unitIndexToRemove, 1);
    this.saveUnits();
    this.emitUnits();
  }

  editIngredient(ingredient: Ingredient, newIngredient: Ingredient){
    this.deleteIngredient(ingredient);
    this.addIngredient(newIngredient);
    this.saveIngredients();
    this.emitIngredients();
  }

  uploadPhoto(photoDataUrl: string, nameIngredient: string, ){
    return new Promise(
      (resolve, reject) => {
        const almostUniqueFileName = Date.now().toString();
        const upload = firebase.storage().ref()
          .child('images/' + almostUniqueFileName + nameIngredient).putString(photoDataUrl, 'data_url');
        upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
          () => {
            console.log('Chargement…');
          },
          (error) => {
            console.log('Erreur de chargement ! : ' + error);
            reject();
          },
          () => {
            resolve(upload.snapshot.ref.getDownloadURL());
          }
        );
      }
    );
  }

  uploadFile(file: File) {
    return new Promise(
      (resolve, reject) => {
        const almostUniqueFileName = Date.now().toString();
        const upload = firebase.storage().ref()
          .child('images/' + almostUniqueFileName + file.name).put(file);
        upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
          () => {
            console.log('Chargement…');
          },
          (error) => {
            console.log('Erreur de chargement ! : ' + error);
            reject();
          },
          () => {
            resolve(upload.snapshot.ref.getDownloadURL());
          }
        );
      }
    );
  }
}