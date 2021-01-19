import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { Ingredient } from 'src/app/models/ingredient.model';
import { Subscription, Observable } from 'rxjs';
import { RecipesService } from 'src/app/services/recipes.service';
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInfiniteScroll, AlertController, IonRouterOutlet, ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { Recipe } from 'src/app/models/recipe.model';

const { App } = Plugins;

@Component({
  selector: 'app-list-recipes',
  templateUrl: './list-recipes.page.html',
  styleUrls: ['./list-recipes.page.scss'],
})
export class ListRecipesPage implements OnInit {

  listRecipes: Recipe[];
  listRecipesSubscription: Subscription;

  dataSource: MatTableDataSource<Recipe>;
  dataSourceObservable: Observable<any>;

  recipesToDelete: Recipe[] = [];
  selectMode: boolean = false;
  pressLocked: boolean = false;

  lengthPaginator = 0;

  @ViewChild(MatPaginator, {read: false, static: true}) paginator: MatPaginator;
  @ViewChild(IonInfiniteScroll, {read: false, static: true}) infiniteScroll: IonInfiniteScroll;

  constructor(
    private recipesService: RecipesService, 
    private route: ActivatedRoute, 
    private router: Router,
    private alertController: AlertController, 
    private platform: Platform,
    private toastController: ToastController,
    private routerOutlet: IonRouterOutlet) { }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(15,() => {
      if(this.selectMode)
        this.closeSelection();
      else if(!this.routerOutlet.canGoBack())
            App.exitApp();
          else
            this.routerOutlet.pop();
    });

    //Voir resolver pour data.recipes
    this.listRecipes = this.route.snapshot.data.recipes;

    this.listRecipesSubscription = this.recipesService.listRecipesSubject.subscribe(
      (recipes: Recipe[]) => { 
        this.listRecipes = recipes;
        this.dataSource = new MatTableDataSource(this.listRecipes);
        this.dataSource.paginator = this.paginator;
        this.dataSourceObservable = this.dataSource.connect();
    })
  }

  ionViewWillEnter() {
    this.dataSource = new MatTableDataSource(this.listRecipes);
    this.dataSource.paginator = this.paginator;
    this.dataSourceObservable = this.dataSource.connect();
  }

  ngOnDestroy() {
    if (this.dataSource)
      this.dataSource.disconnect();
    this.listRecipesSubscription.unsubscribe();
  }
  

  //////////////////////////  PAGINATOR ////////////////////////////
  //Charge les données dans le paginator
  async loadData() {
    if (this.lengthPaginator < this.listRecipes.length)   //Si il reste des recettes on augmente le nombre d'el de la page
    {
      await this.wait(1000);
      this.infiniteScroll.complete();
      this.appendItems(8)
    } 
    else 
      this.infiniteScroll.disabled = true;
  }

  appendItems(number) {
    this.paginator._changePageSize(this.paginator.pageSize + number);
    
    //Si on a tout paginé
    if(this.paginator.pageSize >= this.listRecipes.length)
      this.infiniteScroll.disabled = true;
  }

  wait(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  //Permet de filtrer les recettes selon la chaine de caractères fournie
  applyFilter(filterValue: string) { this.dataSource.filter = filterValue.trim().toLowerCase(); }

  //////////////////////////////// SELECTION ET SUPPRESSION DES RECEZTTES ////////////////////////////////////

  //Clic sur une recette
  onRecipe(recipe: Recipe){
    if(this.selectMode)                         //Si le mode sélection est enclenché, on ajoute la recette
      this.selectRecipe(recipe);
    else                                                                                //Sinon on redirige vers la recette
      this.router.navigate([this.router.url + '/' + recipe.name])
  }

  //Ouvre la sélection
  openSelection(recipe: Recipe){
    this.selectMode = true;
    this.selectRecipe(recipe);
    this.pressLocked = true;
  }

  //Permet de vérouiller la séléction pendant le press (sinon clignotement)
  released(){
    this.pressLocked = false;         
  }

  //Ferme la sélection
  closeSelection(){
    this.recipesToDelete = [];
    this.selectMode = false;
  }

  //Sélectionne ou déselectionne une recette
  selectRecipe(recipe: Recipe){
    if(this.selectMode  && !this.pressLocked)
    {
      //Si case déjà cochée et ingrédient présent dans le tableau -> On enlève
      if(this.recipesToDelete.includes(recipe))
      {
        let index = this.recipesToDelete.indexOf(recipe);
        if (index !== -1) this.recipesToDelete.splice(index, 1);
      }
      else
      {
        this.recipesToDelete.push(recipe);
      }
    }
  }

  //Modifie la classe en cas de sélection / déselection
  isSelected(ingredient: Ingredient){
    if(this.selectMode)
    {
      if(this.ingredientsToDelete.includes(ingredient))
        return true;
      else
       return false;
    }
  }

  //Renvoie le nombre d'ingrédients sélectionnés
  getSizeIngredientsToDelete(){ return this.ingredientsToDelete.length; }

  //Créer l'alerte pour confirmer la supression des ingrédients
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'alertConfirm',
      header: 'Confirmer la suppression',
      message: 'Êtes vous sûr de vouloir supprimer ces ingrédients ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Supprimer',
          handler: () => {
            let numberIngr = this.ingredientsToDelete.length;
            this.deleteIngredients();
            this.presentDeleteToast(numberIngr);
          }
        }
      ]
    });
    await alert.present();
  }

  //Confirmation de la suppression des ingrédients
  async presentDeleteToast(numberIngr: number) {

    let message: string;
    if(numberIngr > 1)
      message = numberIngr + ' ingrédients supprimés !';
    else
      message = numberIngr + ' ingrédient supprimé !';

    const toast = await this.toastController.create({
      message: message,
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
  }

  //Supprime les ingrédients sélectionnés
  deleteIngredients(){
    if(this.ingredientsToDelete.length != 0)
      this.ingredientsService.deleteMultipleIngredients(this.ingredientsToDelete);
    this.ingredientsToDelete = [];
    this.selectMode = false;

    //Penser à décommenter la fonction dans le service
  }
  
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //Arrondi le nombre de points au centième
  roundPoints(points: number){
    return Math.round(points*100)/100;
  }  

}
