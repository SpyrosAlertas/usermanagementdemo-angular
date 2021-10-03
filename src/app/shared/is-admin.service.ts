import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { UserLocalStorageService } from './user-local-storage.service';

import { ErrorModel } from '../error-page/error-model';

@Injectable({
  providedIn: 'root'
})
export class IsAdminService implements CanActivate {

  constructor(private router: Router, private userLocalStorageService: UserLocalStorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.userLocalStorageService.isLoggedIn) {
      // Use local storage service to check if user is logged in
      // If no, navigate to error page and show error message
      this.router.navigate(['error-page'], { state: new ErrorModel('401 - Not Authenticated', '401 - Not Authenticated', 'You have to log in to view this page') });
      // User noτ logged in, not authenticated
      return false;
    } else if (!this.userLocalStorageService.isAdmin) {
      // User local storage service to check if user is admin
      this.router.navigate(['error-page'], { state: new ErrorModel('403 - Not Authorized', '403 - Not Authorized', 'You are not authorized to view this page') });
      // User not an admin, not authorized
      return false;
    }
    // User is authenticated and authorized as Admin
    return true;
  }

}
