import { Routes } from '@angular/router';
import { PicklistComponent } from './picklist.component';
import { DetailsComponent } from './details/details.component';

export default [
  {
    path: '',
    component: PicklistComponent
  },
  {
    path: ':id',
    component: DetailsComponent
  }
] as Routes;
