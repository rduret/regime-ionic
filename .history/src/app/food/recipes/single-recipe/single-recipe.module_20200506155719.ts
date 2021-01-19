import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SingleRecipePageRoutingModule } from './single-recipe-routing.module';

import { SingleRecipePage } from './single-recipe.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SingleRecipePageRoutingModule
  ],
  declarations: [SingleRecipePage]
})
export class SingleRecipePageModule {}
