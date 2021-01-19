import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SingleRecipePage } from './single-recipe.page';

const routes: Routes = [
  {
    path: '',
    component: SingleRecipePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SingleRecipePageRoutingModule {}
