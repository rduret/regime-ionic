import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Recipe } from "../models/recipe.model";
import { RecipesService } from "../services/recipes.service";
import { Subscription } from "rxjs";
import { Ingredient } from "../models/ingredient.model";
import { IngredientsService } from "../services/ingredients.service";
import { Measure } from "../models/measure.model";
import { WeightService } from "../services/weight.service";

@Injectable()
export class RecipesResolver implements Resolve<Recipe[]> {

  listRecipes: Recipe[];
  listRecipesSubscription: Subscription;
  
  constructor(private recipesService: RecipesService) {}

  async resolve(): Promise<Recipe[]>{
    return await this.promiseGetRecipes();
  }

  promiseGetRecipes(){
    return new Promise<Recipe[]>(resolve => {
      this.listRecipesSubscription = this.recipesService.listRecipesSubject.subscribe(
        (recipes: Recipe[]) => {
          if(recipes != undefined)
            resolve(recipes);
        })
      this.recipesService.emitRecipes();  
      });
  }
}

@Injectable()
export class IngredientsResolver implements Resolve<Ingredient[]> {

  listIngredients: Ingredient[];
  listIngredientsSubscription: Subscription;
  
  constructor(private ingredientsService: IngredientsService) {}

  async resolve(): Promise<Ingredient[]>{
    return await this.promiseGetIngredients();
  }

  promiseGetIngredients(){
    return new Promise<Ingredient[]>(resolve => {
        this.listIngredientsSubscription = this.ingredientsService.listIngredientsSubject.subscribe(
            (ingredients: Ingredient[]) => {
            if(ingredients != undefined)
              resolve(ingredients);
            })
        this.ingredientsService.emitIngredients();  
    });
  }
}

@Injectable()
export class MeasuresResolver implements Resolve<Measure[]> {

  listMeasures: Measure[];
  measuresSubscription: Subscription;
  
  constructor(private weightService: WeightService) {}

  async resolve(): Promise<Measure[]>{
    return await this.promiseGetMeasures();
  }

  promiseGetMeasures(){
    return new Promise<Measure[]>(resolve => {
        this.measuresSubscription = this.weightService.measuresSubject.subscribe(
          (measures: Measure[]) => {
            if(measures != undefined)
              resolve(measures);
            })
        this.weightService.getMeasures();
        this.weightService.emitMeasures();
    });
  }
}


@Injectable()
export class UnitsResolver implements Resolve<String[]> {

  listUnits: String[];
  unitsSubscription: Subscription;
  
  constructor(private ingredientsService: IngredientsService) {}

  async resolve(): Promise<String[]>{
    return await this.promiseGetUnits();
  }

  promiseGetUnits(){
    return new Promise<String[]>(resolve => {
        this.unitsSubscription = this.ingredientsService.listUnitsSubject.subscribe(
            (units: String[]) => {
              if(units != undefined)
               resolve(units);
              })
        this.ingredientsService.emitUnits();
        });
  }
}