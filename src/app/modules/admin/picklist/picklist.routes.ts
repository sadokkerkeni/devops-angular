import { Routes } from '@angular/router';
import { PicklistComponent } from './picklist.component';
import { DetailsComponent } from './details/details.component';



const routes: Routes = [
  {
    path: '',
    component: PicklistComponent
  },
  {
    path: ':id',
    component: DetailsComponent
  }
];

export default routes;
