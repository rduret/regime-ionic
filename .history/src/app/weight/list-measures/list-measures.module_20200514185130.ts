import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';


import { IonicModule } from '@ionic/angular';

import { ListMeasuresPageRoutingModule } from './list-measures-routing.module';

import { ListMeasuresPage } from './list-measures.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ListMeasuresPageRoutingModule,
    MatExpansionModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  declarations: [ListMeasuresPage]
})
export class ListMeasuresPageModule {}
