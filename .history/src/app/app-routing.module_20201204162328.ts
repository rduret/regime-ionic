import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RecipesResolver, IngredientsResolver, MeasuresResolver, UnitsResolver } from './resolvers/resolvers';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'mon-suivi',
    pathMatch: 'full'
  },
  {
    path: 'mon-suivi', canActivate: [AuthGuard], resolve: { measures: MeasuresResolver },
    loadChildren: () => import('./weight/recap/recap.module').then( m => m.RecapPageModule)
  },
  {
    path: 'mes-pesées', canActivate: [AuthGuard], resolve: { measures: MeasuresResolver }, 
    loadChildren: () => import('./weight/list-measures/list-measures.module').then( m => m.ListMeasuresPageModule)
  },
  {
    path: 'mon-agenda', canActivate: [AuthGuard],
    loadChildren: () => import('./agenda/agenda/agenda.module').then( m => m.AgendaPageModule)
  },
  {
    path: 'alimentation/ingredients', canActivate: [AuthGuard], resolve: { ingredients: IngredientsResolver },
    loadChildren: () => import('./food/ingredients/list-ingredients/list-ingredients.module').then( m => m.ListIngredientsPageModule)
  },
  {
    path: 'alimentation/ingredients/ajouter-ingredient', canActivate: [AuthGuard],
    loadChildren: () => import('./food/ingredients/add-ingredient/add-ingredient.module').then( m => m.AddIngredientPageModule)
  },
  {
    path: 'alimentation/ingredients/:name', canActivate: [AuthGuard], resolve: { ingredients: IngredientsResolver },
    loadChildren: () => import('./food/ingredients/edit-ingredient/edit-ingredient.module').then( m => m.EditIngredientPageModule)
  },
  {
    path: 'alimentation/recettes', canActivate: [AuthGuard], resolve: { recipes: RecipesResolver },
    loadChildren: () => import('./food/recipes/list-recipes/list-recipes.module').then( m => m.ListRecipesPageModule)
  },
  {
    path: 'alimentation/recettes/ajouter-recette', canActivate: [AuthGuard],
    loadChildren: () => import('./food/recipes/add-recipe/add-recipe.module').then( m => m.AddRecipePageModule)
  },
  {
    path: 'alimentation/recettes/:name', canActivate: [AuthGuard], resolve: { recipes: RecipesResolver },
    loadChildren: () => import('./food/recipes/single-recipe/single-recipe.module').then( m => m.SingleRecipePageModule)
  },
  {
    path: 'alimentation/recettes/:name/modification', canActivate: [AuthGuard], resolve: { ingredients: IngredientsResolver, recipes: RecipesResolver },
    loadChildren: () => import('./food/recipes/edit-recipe/edit-recipe.module').then( m => m.EditRecipePageModule)
  },
  {
    path: 'auth/connexion',
    loadChildren: () => import('./auth/sign-in/sign-in.module').then( m => m.SignInPageModule)
  },
  {
    path: 'auth/inscription',
    loadChildren: () => import('./auth/sign-up/sign-up.module').then( m => m.SignUpPageModule)
  },
  {
    path: 'auth/retrouver-mot-de-passe',
    loadChildren: () => import('./auth/recover-password/recover-password.module').then( m => m.RecoverPasswordPageModule)
  },
  {
    path: 'auth/mon-compte',
    loadChildren: () => import('./auth/my-account/my-account.module').then( m => m.MyAccountPageModule)
  },
  {
    path: 'auth/mon-compte/modifier-mot-de-passe',
    loadChildren: () => import('./auth/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
