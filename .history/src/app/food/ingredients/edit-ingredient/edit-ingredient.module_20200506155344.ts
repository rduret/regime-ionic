import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditIngredientPageRoutingModule } from './edit-ingredient-routing.module';

import { EditIngredientPage } from './edit-ingredient.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditIngredientPageRoutingModule
  ],
  declarations: [EditIngredientPage]
})
export class EditIngredientPageModule {}
