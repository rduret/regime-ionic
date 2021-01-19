import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { Ingredient } from 'src/app/models/ingredient.model';
import { Subscription, Observable } from 'rxjs';
import { IngredientsService } from 'src/app/services/ingredients.service';
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { IonInfiniteScroll, AlertController, IonRouterOutlet, ToastController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { App } = Plugins;

@Component({
  selector: 'app-list-ingredients',
  templateUrl: './list-ingredients.page.html',
  styleUrls: ['./list-ingredients.page.scss'],
})
export class ListIngredientsPage implements OnInit {

  listIngredients: Ingredient[];
  listIngredientsSubscription: Subscription;

  dataSource: MatTableDataSource<Ingredient>;
  dataSourceObservable: Observable<any>;

  ingredientsToDelete: Ingredient[] = [];
  selectMode: boolean = false;
  pressLocked: boolean = false;

  lengthPaginator = 0;

  @ViewChild(MatPaginator, {read: false, static: true}) paginator: MatPaginator;
  @ViewChild(IonInfiniteScroll, {read: false, static: true}) infiniteScroll: IonInfiniteScroll;

  constructor(
    private ingredientsService: IngredientsService, 
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

    //Voir resolver pour data.ingredients
    this.listIngredients = this.route.snapshot.data.ingredients;

    this.listIngredientsSubscription = this.ingredientsService.listIngredientsSubject.subscribe(
      (ingredients: Ingredient[]) => { 
        this.listIngredients = ingredients;
        this.dataSource = new MatTableDataSource(this.listIngredients);
        this.dataSource.paginator = this.paginator;
        this.dataSourceObservable = this.dataSource.connect();
    })
  }

  ionViewWillEnter() {
    this.dataSource = new MatTableDataSource(this.listIngredients);
    this.dataSource.paginator = this.paginator;
    this.dataSourceObservable = this.dataSource.connect();
  }

  ngOnDestroy() {
    if (this.dataSource)
      this.dataSource.disconnect();
    this.listIngredientsSubscription.unsubscribe();
  }
  

  //////////////////////////  PAGINATOR ////////////////////////////
  //Charge les données dans le paginator
  async loadData() {
    console.log('test');
    if (this.lengthPaginator < this.listIngredients.length)   //Si il reste des ingrédients on augmente le nombre d'el de la page
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
    if(this.paginator.pageSize >= this.listIngredients.length)
      this.infiniteScroll.disabled = true;
  }

  wait(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  //Permet de filtrer les ingrédients selon la chaine de caractères fournie
  applyFilter(filterValue: string) { this.dataSource.filter = filterValue.trim().toLowerCase(); }

  //////////////////////////////// SELECTION ET SUPPRESSION DES INGREDIENTS ////////////////////////////////////

  //Clic sur un ingrédient
  onIngredient(ingredient: Ingredient){
    if(this.selectMode)                         //Si le mode sélection est enclenché, on ajoute l'ingrédient
      this.selectIngredient(ingredient);
    else                                                                                //Sinon on redirige vers la modif de l'ingrédient
      this.router.navigate([this.router.url + '/' + ingredient.name])
  }

  //Ouvre la sélection
  openSelection(ingredient: Ingredient, id: string){
    this.selectMode = true;
    this.selectIngredient(ingredient);
    this.pressLocked = true;
  }

  //Permet de vérouiller la séléction pendant le press (sinon clignotement)
  released(){
    this.pressLocked = false;         
  }

  //Ferme la sélection
  closeSelection(){
    this.ingredientsToDelete = [];
    this.selectMode = false;
  }

  //Sélectionne ou déselectionne un ingrédient
  selectIngredient(ingredient: Ingredient){
    if(this.selectMode  && !this.pressLocked)
    {
      //Si case déjà cochée et ingrédient présent dans le tableau -> On enlève
      if(this.ingredientsToDelete.includes(ingredient))
      {
        let index = this.ingredientsToDelete.indexOf(ingredient);
        if (index !== -1) this.ingredientsToDelete.splice(index, 1);
      }
      else
      {
        this.ingredientsToDelete.push(ingredient);
      }
      console.log(this.ingredientsToDelete);
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
