import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { Recipe } from 'src/app/models/recipe.model';
import { Subscription, Observable } from 'rxjs';
import { RecipesService } from 'src/app/services/recipes.service';
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInfiniteScroll, AlertController, IonRouterOutlet, ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';


const { App } = Plugins;

@Component({
  selector: 'app-list-recipes',
  templateUrl: './list-recipes.page.html',
  styleUrls: ['./list-recipes.page.scss'],
})
export class ListRecipesPage implements OnInit {

  //Liste de toutes les recettes
  listRecipes: Recipe[];
  listRecipesSubscription: Subscription;

  dataSource: MatTableDataSource<Recipe>;
  dataSourceObservable: Observable<any>;

  //Tableau contenant les recettes à supprimer
  recipesToDelete: Recipe[] = [];

  //Variables utilisées pour le mode sélection
  selectMode: boolean = false;
  pressLocked: boolean = false;

  //Taille du paginator
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
  

  /**************************************************** PAGINATOR ****************************************************/
  //Décide ou non de rajouter des ingrédients dans le paginator
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

  //Change la taille du paginator (ajout d'ingrédients dans le paginator)
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

/******************************************** SELECTION ET SUPPRESSION DES INGREDIENTS *********************************************/
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
      //Si case déjà cochée et recette présent dans le tableau -> On enlève
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
  isSelected(recipe: Recipe){
    if(this.selectMode)
    {
      if(this.recipesToDelete.includes(recipe))
        return true;
      else
       return false;
    }
  }

  /*************************************************** FONCTIONS SECONDAIRES ***************************************************/

  //Renvoie le nombre de recettes sélectionnés
  getSizeRecipesToDelete(){ return this.recipesToDelete.length; }

  //Créer l'alerte pour confirmer la supression des recettes
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'alertConfirm',
      header: 'Confirmer la suppression',
      message: 'Êtes vous sûr de vouloir supprimer ces recettes ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Supprimer',
          handler: () => {
            let numberRecipes = this.recipesToDelete.length;
            this.deleteRecipes();
            this.presentDeleteToast(numberRecipes);
          }
        }
      ]
    });
    await alert.present();
  }

  //Confirmation de la suppression des recettes
  async presentDeleteToast(numberRecipes: number) {

    let message: string;
    if(numberRecipes > 1)
      message = numberRecipes + ' recettes supprimées !';
    else
      message = numberRecipes + ' recette supprimée !';

    const toast = await this.toastController.create({
      message: message,
      color: 'primary',
      cssClass: 'toast',
      duration: 2000,
    });
    toast.present();
  }

  //Supprime les recettes sélectionnées
  deleteRecipes(){
    if(this.recipesToDelete.length != 0)
      this.recipesService.deleteMultipleRecipes(this.recipesToDelete);
    this.recipesToDelete = [];
    this.selectMode = false;
  }
  
  //Arrondi le nombre de points au centième
  roundPoints(points: number){
    return Math.round(points*100)/100;
  }  

}
