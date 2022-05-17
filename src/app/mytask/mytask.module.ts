import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MytaskRoutingModule } from './mytask-routing.module';
import { ListComponent } from './list.component';
import { LayoutComponent } from './layout.component';
import { AddEditComponent } from './add-edit.component';

@NgModule({
  imports: [
    CommonModule,
    MytaskRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [
      LayoutComponent,
      ListComponent,
      AddEditComponent
  ]
})
export class MytaskModule { }
