import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserLocalStorageService } from '../shared/user-local-storage.service';
import { UserService } from '../shared/user.service';

import { TokenModel } from '../shared/token-model';
import { Notification } from '../shared/notification';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  // Store subscription of the current user stored in local storage
  currentUserSubscription: Subscription | undefined;
  // Current user info from local storage if any
  currentUser: TokenModel | undefined;

  // Users profile image, has to be of type SafeUrl and be sanitized else Angular doesn't allow us to display it (for security reasons)
  // Blob we have users profile image, null user has no profile image, undefined we don't know if user has a profile image
  profileImage: Blob | null | undefined;
  // So we don't show default profile image before we know if user has or doesn't have a profile image
  profileImageLoading: boolean = true;

  // Create an empty alert notification box (for when user deletes his account)
  alert: Notification | undefined;

  constructor(
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private userLocalStorageService: UserLocalStorageService
  ) {
    // Check if navigation to this route received any data
    // for example when user deletes his account so we can
    // provide feedback to the user that his actions where
    // actually successful
    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .subscribe(data => {
        if (data.message) {
          this.alert = { message: data.message, type: data.type };
        }
      }).unsubscribe(); // At the end we have to unsubscribe
  }

  ngOnInit(): void {

    this.titleService.setTitle(`Home | ${environment.appTitle}`);

    this.currentUserSubscription = this.userLocalStorageService.getUserSubject()
      .subscribe((currentUser: TokenModel) => {
        this.currentUser = currentUser;
        if (this.currentUser)
          // If there is a user logged in
          this.userService.downloadProfileImage(this.currentUser.username)
            .subscribe((profileImage: Blob) => {
              // Download profile image, save it locally in HomeComponent
              this.profileImage = profileImage;
              // Profile image loading complete - status to false
              this.profileImageLoading = false;
            }, err => {
              this.alert = { message: 'Cannot establish communication with the server. Please try again later.', type: 'danger' };
            });
      });

    // We need this, so if user refreshes/reloads the page, current user info are reloaded too from local storage
    this.userLocalStorageService.onPageRefresh();

  }

  ngOnDestroy(): void {
    // We have to unsuscribe from these subscriptions each time this component gets destroyed
    // else we create a memory leak, creating new subscriptions without closing the old ones each time we reinitialize this component
    if (this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

}
