import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { UserLocalStorageService } from './user-local-storage.service';

import { ErrorModel } from '../error-page/error-model';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedInService implements CanActivate {

  constructor(private router: Router, private userLocalStorageService: UserLocalStorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.userLocalStorageService.isLoggedIn) {
      // If there is no token stored (in local storage), user is not logged in
      // Navigate to error page and show error message
      this.router.navigate(['error-page'], { state: new ErrorModel('401 - Not Authenticated', '401 - Not Authenticated', 'You have to log in to view this page') });
      // User not logged in, not authenticated
      return false;
    }
    // User is logged in, authenticated
    return true;
  }

}
