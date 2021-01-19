import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditIngredientPageRoutingModule } from './edit-ingredient-routing.module';

import { EditIngredientPage } from './edit-ingredient.page';
import { MatProgressSpinnerModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditIngredientPageRoutingModule,
    MatProgressSpinnerModule,
  ],
  declarations: [EditIngredientPage]
})
export class EditIngredientPageModule {}
