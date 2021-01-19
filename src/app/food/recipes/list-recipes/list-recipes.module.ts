import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListRecipesPageRoutingModule } from './list-recipes-routing.module';

import { ListRecipesPage } from './list-recipes.page';
import { MatPaginatorModule, MatFormFieldModule, MatCardModule, MatDialogModule, MatTableModule, MatInputModule } from '@angular/material';
import { LongPressModule } from 'ionic-long-press';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCardModule,
    MatDialogModule,
    MatTableModule,
    MatInputModule,
    LongPressModule,

    ListRecipesPageRoutingModule
  ],
  declarations: [ListRecipesPage]
})
export class ListRecipesPageModule {}
