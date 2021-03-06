import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material';
import { IonicModule } from '@ionic/angular';

import { AddIngredientPageRoutingModule } from './add-ingredient-routing.module';

import { AddIngredientPage } from './add-ingredient.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    AddIngredientPageRoutingModule
  ],
  declarations: [AddIngredientPage]
})
export class AddIngredientPageModule {}
