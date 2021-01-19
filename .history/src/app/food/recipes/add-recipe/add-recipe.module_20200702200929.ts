import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddRecipePageRoutingModule } from './add-recipe-routing.module';

import { AddRecipePage } from './add-recipe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AddRecipePageRoutingModule
  ],
  declarations: [AddRecipePage]
})
export class AddRecipePageModule {}
