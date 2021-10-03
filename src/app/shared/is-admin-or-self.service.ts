import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { UserLocalStorageService } from './user-local-storage.service';

import { ErrorModel } from '../error-page/error-model';

@Injectable({
  providedIn: 'root'
})
export class IsAdminOrSelfService implements CanActivate {

  constructor(private router: Router, private userLocalStorageService: UserLocalStorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // If user is admin he can view anyones profile, authorize user or if user tries to view his own profile, authorize user
    if (this.userLocalStorageService.isAdmin || route.params['username'] === this.userLocalStorageService.username)
      return true;
    // If user is not logged in
    if (!this.userLocalStorageService.isLoggedIn) {
      // Navigate to error page and show error message
      this.router.navigate(['error-page'], { state: new ErrorModel('401 - Not Authenticated', '401 - Not Authenticated', 'You have to log in to view this page') });
    } else {
      this.router.navigate(['error-page'], { state: new ErrorModel('403 - Not Authorized', '403 - Not Authorized', 'You are not authorized to view this page') });
    }
    // Else if he is neither an admin nor he wants to view his own profile he isn't authorized
    return false;
  }

}
