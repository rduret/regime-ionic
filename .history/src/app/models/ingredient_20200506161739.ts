export class Ingredient {

    name: string;
    photoUrl: string;
    unit: string;               //Dose : cuillère / portion / tranche /g /mg ...
    ratio: number;              //Nbr de points pour 1 unité


    //Ces valeurs sont définies seulement au sein d'une recette
    quantity: number;  //Quantité
    points: number;    //Nbr de points en fonction de la quantité
    
    public constructor(name: string, unit: string, ratio: number, photoUrl: string = 'assets/img/default.png', quantity?: number) {
        this.name = name;
        this.unit = unit;
        this.ratio = ratio;
        this.photoUrl = photoUrl;

        if(quantity)
        {
            this.quantity = quantity;
            this.points = this.quantity * this.ratio;
        }
    }
}
