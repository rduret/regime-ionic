import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditIngredientPage } from './edit-ingredient.page';

const routes: Routes = [
  {
    path: '',
    component: EditIngredientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditIngredientPageRoutingModule {}
