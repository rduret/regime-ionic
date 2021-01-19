import { Component, OnInit } from '@angular/core';
import { RecipesService } from 'src/app/services/recipes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from 'src/app/models/recipe.model';
import { Subscription } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-single-recipe',
  templateUrl: './single-recipe.page.html',
  styleUrls: ['./single-recipe.page.scss'],
})
export class SingleRecipePage implements OnInit {

  //Recette visitée
  recipe: Recipe;

  //Nombre de personnes prévu pour la recette
  tempPeoples: number;

  //Liste des recettes
  listRecipes: Recipe[];

  constructor(
    private recipeService: RecipesService, 
    private route: ActivatedRoute, 
    private router: Router,
    private alertController: AlertController, 
    private toastController: ToastController) { }

  ngOnInit() {
    //Voir resolver pour data.recipes
    this.listRecipes = this.route.snapshot.data.recipes;
    this.recipe = this.getRecipeByName();
    this.tempPeoples = this.recipe.peoples;
  }

  //On récupère la recette sélectionnée grâce à l'url 
  getRecipeByName() {
    let name = this.route.snapshot.params['name'];
    const recipe = this.listRecipes.find(
      (s) => {
        return s.name === name;
      }
    );
    if(recipe) return recipe;
    else this.router.navigate(['/alimentation/recettes']);
  }

  //Supprime la recette
  deleteRecipe(){
    this.recipeService.deleteRecipe(this.recipe);
    this.router.navigate(['/alimentation/recettes']);
  }

  //Ajoute une personne
  plusPeoples(){this.tempPeoples ++;}

  //Retire une personne
  minusPeoples(){
    if(this.tempPeoples > 1)
      this.tempPeoples --;
  }


  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'alertConfirm',
      header: 'Confirmer la suppression',
      message: "Êtes vous sûr de vouloir supprimer la recette '" + this.recipe.name + "' ?" ,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Supprimer',
          handler: () => {
            this.deleteRecipe();
            this.presentDeleteToast(this.recipe.name);
          }
        }
      ]
    });
    await alert.present();
  }

  async presentDeleteToast(name: string) {
    const toast = await this.toastController.create({
      message: name + ' a été supprimé !',
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
  }

  //Arrondi le nombre de points pour la recette
  roundRecipePoints(points: number){ return Math.round(points); }

  //Arrondi le nombre de points pour chaque ingredient à 1 chiffre apres la virgule
  roundIngredientPoints(points: number){ return Math.round(points*10)/10; }
}
