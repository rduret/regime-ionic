import { Ingredient } from './ingredient.ts';

export class Recipe {

    name: string;
    photoUrl: string;
    points: number;
    listIngredients: Ingredient[];
    peoples: number;
  
    public constructor(name: string, listIngredients: Ingredient[], points: number, peoples: number, photoUrl: string = 'assets/img/default.png') {
        this.name = name;
        this.listIngredients = listIngredients;
        this.points = points;
        this.peoples = peoples;
        this.photoUrl = photoUrl;
    }
}
