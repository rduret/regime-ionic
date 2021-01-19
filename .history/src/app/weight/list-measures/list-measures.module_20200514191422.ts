import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SignNumberPipe } from '../../pipes/sign-number.pipe'

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
    MatTableModule,
    MatPaginatorModule,
    MatNativeDateModule
  ],
  declarations: [ListMeasuresPage, SignNumberPipe]
})
export class ListMeasuresPageModule {}
