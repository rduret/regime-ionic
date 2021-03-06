import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditIngredientPageRoutingModule } from './edit-ingredient-routing.module';

import { EditIngredientPage } from './edit-ingredient.page';
import { MatProgressSpinnerModule, MatButtonModule, MatSelectModule, MatIconModule, MatInputModule, MatCardModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    EditIngredientPageRoutingModule
  ],
  declarations: [EditIngredientPage]
})
export class EditIngredientPageModule {}
