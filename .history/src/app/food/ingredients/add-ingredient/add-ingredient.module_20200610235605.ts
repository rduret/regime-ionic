import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

import { IonicModule } from '@ionic/angular';

import { AddIngredientPageRoutingModule } from './add-ingredient-routing.module';

import { AddIngredientPage } from './add-ingredient.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatCardModule,
    AddIngredientPageRoutingModule
  ],
  declarations: [AddIngredientPage]
})
export class AddIngredientPageModule {}
