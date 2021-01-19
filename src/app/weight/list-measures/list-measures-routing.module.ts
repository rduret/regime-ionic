import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListMeasuresPage } from './list-measures.page';

const routes: Routes = [
  {
    path: '',
    component: ListMeasuresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListMeasuresPageRoutingModule {}
