import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { UserLocalStorageService } from '../shared/user-local-storage.service';

import { UserModel } from '../shared/user-model';
import { TokenModel } from '../shared/token-model';
import { Notification } from '../shared/notification';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // Boolean to know when navbar is collapsed or not
  isNavbarCollapsed: boolean = true;

  // Booleans to know when login pop up box or register box are open
  isLoginBoxOpen: boolean = false;
  isRegisterBoxOpen: boolean = false;

  // Holds logged in users data
  user: UserModel | null = null;

  // Create an empty alert notification box
  alert: Notification | undefined;

  // Initialize current user username and role from local storage (beacuse if we refresh page for example we need to remember previous state)
  username: string = this.userLocalStorageService.username;
  role: string = this.userLocalStorageService.role;

  expiresAt: number = 0;

  private timeSubscription: Subscription | undefined;

  constructor(private router: Router, private userLocalStorageService: UserLocalStorageService) { }

  ngOnInit(): void {

    console.log(`${environment.appTitle} by Spyros Alertas - 2021`);
    console.log(`Using server at ${environment.serverUrl} ${environment.serverUrl.includes('8080') ? '(Spring Boot)' : '(NodeJS)'}`);

    // Here there is no reason to store subscription and unsubscribe because header
    // is a component that is created twice and never destroyed anyway
    this.userLocalStorageService.getUserSubject()
      .subscribe((user: TokenModel) => {
        // When current user logs in/logs out, this code will execute again
        // if user logs out user will be undefined and in case he logs out
        // we must make sure we don't subscribe again for token expiration timer
        this.username = user?.username;
        this.role = user?.myRole;
        this.expiresAt = (user?.expiresAt);
        this.alert = undefined;
        if (this.username && !this.timeSubscription) {
          // If user logged in, this will be true - If user logged out, this will false (no username)
          this.timeSubscription = interval(1000)
            .subscribe((x) => {
              if (this.expiresAt - new Date().getTime() < 1000 || isNaN(this.expiresAt)) {
                // Log out current user/Remove user credentials from local storage
                this.userLocalStorageService.logout();
                this.alert = { message: 'Your credentials have expired. Please login again', type: 'warning' };
                // Redirect user to homepage
                this.router.navigate(['/']);
              }
            });
        } else if (!this.username) {
          // If user logged out
          this.timeSubscription?.unsubscribe();
          this.timeSubscription = undefined;
        }
      });
    // We need this, so if user refreshes/reloads the page, current user info are reloaded too from local storage
    this.userLocalStorageService.onPageRefresh();
  }

  // Toggle open/closed the login dropdown window
  toggleLoginBox(): void {
    this.isLoginBoxOpen = !this.isLoginBoxOpen;
    this.isRegisterBoxOpen = false;
  }

  // Toggle open/closed the register dropdown window
  toggleRegisterBox(): void {
    this.isRegisterBoxOpen = !this.isRegisterBoxOpen;
    this.isLoginBoxOpen = false;
  }

  // Log out user from browser/client app
  logout(): void {
    // If user logs out, use the logout method from UserLocalStorageService to remove users data from local storage
    this.userLocalStorageService.logout();
    // also remove username and role from header component
    this.username = '';
    this.role = '';
    // and then redirect to homepage
    this.router.navigate(['']);
  }

  loginSuccess(): void {
    // User successfully authenticated, save username and role in header component (retrieve them from jwt from local storage)
    this.username = this.userLocalStorageService.username;
    this.role = this.userLocalStorageService.role;
  }

  // When user registers successfully - child component (register) uses this to notify the header component
  registerSuccessNotification(): void {
    // Event listener for when user registers in successfully
    this.alert = { message: 'You have successfuly registered! Your account is pending activation by admins before you can log in!', type: 'success' };
  }

  // Returns how much time is remaining until token expires - converting milliseconds to hours, minutes and seconds
  get expiresAtFormatted(): string {
    let time: number = this.expiresAt - new Date().getTime();
    const hours: number = Math.floor(time / 3600000);
    time -= hours * 3600000;
    const minutes: number = Math.floor(time / 60000);
    time -= minutes * 60000;
    const seconds: number = Math.floor(time / 1000);
    time -= seconds * 1000;
    return `${hours} hrs ${minutes} mins ${seconds} secs`;
  }

}
