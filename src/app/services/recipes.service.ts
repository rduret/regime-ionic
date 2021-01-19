import { Injectable } from '@angular/core';
import { Recipe } from '../models/recipe.model';
import { Subject } from 'rxjs';
import * as firebase from 'firebase';
import DataSnapshot = firebase.database.DataSnapshot;

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  listRecipes: Recipe[];
  listRecipesSubject = new Subject<Recipe[]>();

  constructor() { 
    this.getRecipes();
  }

  emitRecipes(){
    this.listRecipesSubject.next(this.listRecipes);
  }

  getRecipes(){
    firebase.database().ref('/food/recipes')
    .on('value', (data: DataSnapshot) => {
      this.listRecipes = data.val() ? data.val() : [];
      this.emitRecipes();
      }
    );
  }

  saveRecipes(){
    firebase.database().ref('/food/recipes').set(this.listRecipes);
  }

  addRecipe(recipe: Recipe){
    this.listRecipes.push(recipe);
    this.saveRecipes();
    this.emitRecipes();
  }

  deletePhoto(url: string){
    firebase.storage().refFromURL(url).delete();
  }
  
  //Supprime la recette et sa photo associée
  deleteRecipe(recipe: Recipe){
    if(recipe.photoUrl && recipe.photoUrl != "assets/img/default.png") {

      const storageRef = firebase.storage().refFromURL(recipe.photoUrl);
      storageRef.delete().then(
        () => {
          console.log('Photo removed!');
        },
        (error) => {
          console.log('Could not remove photo! : ' + error);
        });
      }


    const recipeIndexToRemove = this.listRecipes.findIndex(
      (recipeEl) => {
        if(recipeEl === recipe) {
          return true;
        }
      }
    );
    this.listRecipes.splice(recipeIndexToRemove, 1);
    this.saveRecipes();
    this.emitRecipes();
  }

  deleteMultipleRecipes(recipes: Recipe[]){
    recipes.forEach(recipe => {
      if(recipe.photoUrl != "" && recipe.photoUrl != "assets/img/default.png") {

        const storageRef = firebase.storage().refFromURL(recipe.photoUrl);
        storageRef.delete().then(
          () => {
            console.log('Photo removed!');
          },
          (error) => {
            console.log('Could not remove photo! : ' + error);
          });
        }
  
      const recipeIndexToRemove = this.listRecipes.findIndex(
        (recipeEl) => {
          if(recipeEl === recipe) {
            return true;
          }
        }
      );
  
      this.listRecipes.splice(recipeIndexToRemove, 1);
    })
    this.saveRecipes();
    this.emitRecipes();
  }

  //Supprime uniquement la recette sans sans photo
  deleteOnlyRecipe(recipe: Recipe){
    const recipeIndexToRemove = this.listRecipes.findIndex(
      (recipeEl) => {
        if(recipeEl === recipe) {
          return true;
        }
      }
    );
    this.listRecipes.splice(recipeIndexToRemove, 1);
    this.saveRecipes();
    this.emitRecipes();
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
}
