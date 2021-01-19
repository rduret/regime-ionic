import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListIngredientsPage } from './list-ingredients.page';

const routes: Routes = [
  {
    path: '',
    component: ListIngredientsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListIngredientsPageRoutingModule {}
