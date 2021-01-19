import { Component, OnInit } from '@angular/core';
import { RecipesService } from 'src/app/services/recipes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from 'src/app/models/recipe.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-recipe',
  templateUrl: './single-recipe.page.html',
  styleUrls: ['./single-recipe.page.scss'],
})
export class SingleRecipePage implements OnInit {

  recipe: Recipe;
  tempPeoples: number;

  listRecipes: Recipe[];
  listRecipesSubscription: Subscription;

  constructor(
    private recipeService: RecipesService, 
    private route: ActivatedRoute, 
    private router: Router, ) { }

  ngOnInit() {
    //Voir resolver pour data.recipes
    this.listRecipes = this.route.snapshot.data.recipes;

    this.recipe = this.getRecipeByName();
    this.tempPeoples = this.recipe.peoples;
  }

  
  ngOnDestroy(){

  }  

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

  minusPeoples(){
    if(this.tempPeoples > 1)
      this.tempPeoples --;
  }

  plusPeoples(){
    this.tempPeoples ++;
  }

  //Arrondi le nombre de points pour la recette
  roundRecipePoints(points: number){ return Math.round(points); }

  //Arrondi le nombre de points pour chaque ingredient à 1 chiffre apres la virgule
  roundIngredientPoints(points: number){ return Math.round(points*10)/10; }

  //Supprime la recette
  deleteRecipe(){
    this.recipeService.deleteRecipe(this.recipe);
    this.router.navigate(['/alimentation/recettes']);
  }
}
