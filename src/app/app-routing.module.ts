import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

import { ErrorPageComponent } from './error-page/error-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { IsAdminService } from './shared/is-admin.service';
import { IsAdminOrSelfService } from './shared/is-admin-or-self.service';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: 'admin-panel', canActivate: [IsAdminService],
    children: [
      { path: '', component: AdminPanelComponent, pathMatch: 'full' }
    ]
  },
  {
    path: 'profile',
    children: [
      { path: '', component: MyProfileComponent, pathMatch: 'full' },
      { path: ':username', component: UserProfileComponent, canActivate: [IsAdminOrSelfService] }
    ]
  },
  { path: 'error-page', component: ErrorPageComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
