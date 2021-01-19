import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditRecipePageRoutingModule } from './edit-recipe-routing.module';

import { EditRecipePage } from './edit-recipe.page';
import { MatFormField, MatFormFieldModule, MatProgressSpinnerModule, MatAutocompleteModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditRecipePageRoutingModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  declarations: [EditRecipePage]
})
export class EditRecipePageModule {}
