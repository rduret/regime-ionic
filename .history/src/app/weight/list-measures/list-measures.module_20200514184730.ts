import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

import { IonicModule } from '@ionic/angular';

import { ListMeasuresPageRoutingModule } from './list-measures-routing.module';

import { ListMeasuresPage } from './list-measures.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListMeasuresPageRoutingModule,
    MatExpansionModule,
  ],
  declarations: [ListMeasuresPage]
})
export class ListMeasuresPageModule {}
