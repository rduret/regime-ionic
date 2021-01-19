import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MatPaginatorModule } from '@angular/material/paginator';

import { ListIngredientsPageRoutingModule } from './list-ingredients-routing.module';

import { ListIngredientsPage } from './list-ingredients.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListIngredientsPageRoutingModule,
    MatPaginatorModule,
  ],
  declarations: [ListIngredientsPage]
})
export class ListIngredientsPageModule {}
