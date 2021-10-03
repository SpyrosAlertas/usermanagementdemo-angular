import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserLocalStorageService } from '../shared/user-local-storage.service';
import { UserService } from '../shared/user.service';

import { UserModel } from '../shared/user-model';
import { Notification } from '../shared/notification';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  // Holds users data (with username from path parameter)
  user: UserModel | null = null;

  // Form filled with users data, create an empty form initially - we will fill it with users data after we fetch them from the server
  profileForm: FormGroup = new FormGroup({});;

  // Users profile image, has to be of type SafeUrl and be sanitized else Angular doesn't allow us to display it
  profileImage: Blob | null = null;
  // True while client is downloading profile image from server to display in html
  profileImageLoading: boolean = true;
  // True when user uploads a new profile image, and until uploading completes
  uploadingProfileImage: boolean = false;

  // True when user has clicked to edit his profile data
  isEditing: boolean = false;

  // True when user clicks on image upload file selector box - if we click outside we want to close
  wasInsideUploadBox: boolean = true;

  // Holds errors like file format not supported or file too large, for image file upload pop up window
  imageUploadErrorMessage: string | undefined;

  // Create an empty alert notification box
  alert: Notification | undefined;

  // Hold subscription of path params, so we can unsubscribe in ngOnDestroy
  pathParamSubscription: Subscription | undefined;

  serverConnectionError: boolean = false;

  // Truth when user is viewing his own profile - if not he must be an admin
  isSelf: boolean = false;
  // When users account has been deleted
  isDeleted: boolean = false;

  constructor(
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private userLocalStorageService: UserLocalStorageService
  ) { }

  ngOnInit(): void {

    this.titleService.setTitle(`Profile | ${environment.appTitle}`);

    // Subscribe to path parameters to observe any change that may occur (when user clicks on
    // his username on header component when he is already in someone elses profile)
    this.pathParamSubscription = this.route.paramMap
      .subscribe(() => {
        // Get users data - any time we change the path parameter
        this.getUser(this.route.snapshot.params['username']);
        if (this.route.snapshot.params['username'] === this.userLocalStorageService.username) {
          // Check if username from url and username from local storage (jwt) are the same
          // if so user is viewing his own profile or else he has to be an admin
          this.isSelf = true;
        }
        // Get users profile image
        this.getProfileImage(this.route.snapshot.params['username']);
      });

  }

  ngOnDestroy(): void {
    // Unsubscribe from our subscriptions before destroying component to prevent memory leaks
    this.pathParamSubscription?.unsubscribe();
  }

  // Enable/Disable ediiting of users profile
  toggleEditing(): void {
    this.alert = undefined;
    this.isEditing = !this.isEditing;
    // Create an array of the fields we want the user to be able to edit
    const formControlsToToggle: string[] = ['password', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'address'];
    formControlsToToggle.forEach(c =>
      // For each of these fields toggle editing status depending on boolean status
      this.isEditing ? this.profileForm.controls[c].enable() : this.profileForm.controls[c].disable()
    );
  }

  // Save updated user info to server/db
  saveChanges(): void {

    this.alert = undefined;

    // Object to hold the updated user data
    const updatedUser: UserModel = new UserModel();
    // A boolean to check if any change actually happened
    // else there is no reason to send an update request to the server
    let isChanged: boolean = false;

    // Username should never change
    updatedUser.username = this.profileForm.get('username')?.value;

    if (this.profileForm.get('password') && this.profileForm.get('password')?.value !== '****') {
      // If password was changed - we have no way of knowing if he actually changed it
      // without hitting the server and db so consider any password he may type as new
      updatedUser.password = this.profileForm.get('password')?.value;
      isChanged = true;
    }
    if (this.profileForm.get('firstName')) {
      updatedUser.firstName = this.profileForm.get('firstName')?.value;
      if (this.user?.firstName !== updatedUser.firstName) {
        // Users firstName can never be null (or at least should not), but Angular has no way of knowing here
        isChanged = true;
      }
    }
    if (this.profileForm.get('lastName')) {
      updatedUser.lastName = this.profileForm.get('lastName')?.value;
      if (this.user?.lastName !== updatedUser.lastName) {
        // Users lastName can never be null (or at least should not), but Angular has no way of knowing here
        isChanged = true;
      }
    }
    if (this.profileForm.get('email')) {
      updatedUser.email = this.profileForm.get('email')?.value;
      if (this.user?.email !== updatedUser.email) {
        // Users email can never be null (or at least should not), but Angular has no way of knowing here
        isChanged = true;
      }
    }
    if (this.profileForm.get('phone')) {
      updatedUser.phone = this.profileForm.get('phone')?.value;
      if (!this.user?.phone || this.user?.phone !== updatedUser.phone) {
        if (updatedUser.phone === '') {
          // When users deletes a field it's an empty string but server/db expects undefined or a valid value
          updatedUser.phone = undefined;
        }
        if (this.user?.phone !== updatedUser.phone) {
          // Check if there was actually a change in his phone
          isChanged = true;
        }
      }
    }
    if (this.profileForm.get('country')) {
      updatedUser.country = this.profileForm.get('country')?.value;
      if (!this.user?.country || this.user?.country !== updatedUser.country) {
        if (updatedUser.country === '') {
          // When users deletes a field it's an empty string but server/db expects undefined or a valid value
          updatedUser.country = undefined;
        }
        if (this.user?.country !== updatedUser.country) {
          // Check if there was actually a change in his country
          isChanged = true;
        }
      }
    }
    if (this.profileForm.get('city')) {
      updatedUser.city = this.profileForm.get('city')?.value;
      if (!this.user?.city || this.user?.city !== updatedUser.city) {
        if (updatedUser.city === '') {
          // When users deletes a field it's an empty string but server/db expects undefined or a valid value
          updatedUser.city = undefined;
        }
        if (this.user?.city !== updatedUser.city) {
          // Check if there was actually a change in his city
          isChanged = true;
        }
      }
    }
    if (this.profileForm.get('address')) {
      updatedUser.address = this.profileForm.get('address')?.value;
      if (!this.user?.address || this.user?.address !== updatedUser.address) {
        if (updatedUser.address === '') {
          // When users deletes a field it's an empty string but server/db expects undefined or a valid value
          updatedUser.address = undefined;
        }
        if (this.user?.address !== updatedUser.address) {
          // Check if there was actually a change in his address
          isChanged = true;
        }
      }
    }

    if (isChanged) {
      // If there was any change, call service to update user data on server/db
      this.user = updatedUser;
      this.updateUser(updatedUser);
      this.user.password = '****';
      this.resetForm();
    } else {
      // if there was no change, just toggle of editing mode
      this.toggleEditing();
    }

  }

  // Delete users profile
  deleteProfile(): void {
    // Delete users profile
    this.userService.deleteUser(this.route.snapshot.params['username'])
      .subscribe(() => {
        // Success deleting user
        if (!this.isSelf) {
          // If an admin deleted someone elses profile, just show a success notification
          this.alert = { message: `Account ${this.route.snapshot.params['username']} successfully deleted.`, type: 'success' };
          this.isDeleted = true;
        } else {
          // If user/admin deleted his own profile, log him out (remove credentials from local storage)
          this.userLocalStorageService.logout();
          // Redirect user to homepage, showing a notification of success
          this.router.navigate(['/'], { state: { type: 'success', message: 'Account deletion was successful. We are sorry to see you go!' } });
        }
      }, (err: any) => {
        if (err.error.code) {
          // If there is an error.code in err, we received error message from the server
          this.alert = { message: err.error.message, type: 'danger' };
        } else {
          // Otherwise, client couldn't establish connection to the server
          this.alert = { message: 'Error communicating with the server. Please try again later.', type: 'danger' };
        }
      });
  }

  // Activate users profile
  activateProfile(): void {
    this.userService.activateUser(this.route.snapshot.params['username'])
      .subscribe(() => {
        // Users account successfully activated - update local user status too and show notification
        if (this.user) {
          this.user.isEnabled = true;
        }
        this.alert = { message: 'Account activation was successful.', type: 'success' };
      }, (err: any) => {
        if (err.error.code) {
          // If there is an error.code in err, we received error message from the server
          this.alert = { message: err.error.message, type: 'danger' };
        } else {
          // Otherwise, client couldn't establish connection to the server
          this.alert = { message: 'Error communicating with the server. Please try again later.', type: 'danger' };
        }
      });
  }

  // Reset changes user may have made and disable editing
  resetForm(): void {
    // Reset values to the original ones
    this.profileForm.reset(this.initProfileForm().value);
    // Toggle editing mode off
    this.toggleEditing();
    this.alert = undefined;
  }

  // Returns all form controls in an array (required for looping the form controls in html)
  get formControls(): string[] {
    const controls: string[] = [];
    for (const control in this.profileForm.controls) {
      controls.push(control);
    }
    return controls;
  }

  // Upload new profile image
  profileImageUpdate(profileImage: any): void {
    this.alert = undefined;
    // We do check the file type and file size here although server can handle such errors and reject them,
    // because we want to decrease as much as possible server and db requests and provide the user with a
    // response as quick as possible
    const SUPPORTED_IMG_EXTS: string[] = ['jpg', 'jpeg', 'png'];
    if (!SUPPORTED_IMG_EXTS.includes(profileImage.target.files[0].type.split('/')[1])) {
      // Check file type, if it's not supported
      this.imageUploadErrorMessage = `File Format ${profileImage.target.files[0].type} is not supported. Please try with another file.`;
    } else if (profileImage.target.files[0].size > environment.maxFileSize) {
      // Check image file size, if it's larger than what the server allows
      this.imageUploadErrorMessage = `File size is too large. Try another file smaller than ${environment.maxFileSize / 1000000} mb.`;
    } else {
      // File format is supported and file size is ok - procceed with uploading on server
      this.imageUploadErrorMessage = undefined;
      if (this.user?.username) {
        this.alert = { message: 'Please wait while uploading profile image.', type: 'warning' };
        // User normally will never be undefined at this point
        this.userService.uploadProfileImage(this.user?.username, profileImage.target.files[0])
          .subscribe(() => {
            // Nothing to do here
          }, (err: any) => {
            if (err.error.code) {
              // If there is an error.code in err, we received error message from the server
              this.alert = { message: err.error.message, type: 'danger' };
            } else {
              // Otherwise, client couldn't establish connection to the server
              this.alert = { message: 'Error communicating with the server. Please try again later.', type: 'danger' };
            }
          }, () => {
            // Upon successfull completion of the request
            this.profileImage = profileImage.target.files[0];
            this.alert = { message: 'Profile image successfully uploaded.', type: 'success' };
            this.toggleUploadingProfileImage();
          });
      }
    }
  }

  // Delete users profile image
  profileImageDelete(): void {
    this.alert = { message: 'Please wait while deleting profile image.', type: 'warning' };
    if (this.user?.username) {
      // Call service to remove profile image from server
      this.userService.deleteProfileImage(this.user.username)
        .subscribe(() => {
          // Success, remove profile image locally as well
          this.profileImage = null;
          this.alert = { message: 'Profile image successfully deleted.', type: 'success' };
        }, (err: any) => {
          if (err.error.code) {
            // If there is an error.code in err, we received error message from the server
            this.alert = { message: err.error.message, type: 'danger' };
          } else {
            // Otherwise, client couldn't establish connection to the server
            this.alert = { message: 'Error communicating with the server. Please try again later.', type: 'danger' };
          }
        });
    }
  }

  // Toggle open/close the box of uploading a new profile image
  toggleUploadingProfileImage(): void {
    this.uploadingProfileImage = !this.uploadingProfileImage;
    this.wasInsideUploadBox = true;
    this.imageUploadErrorMessage = undefined;
  }

  // Catch click inside upload profile image box
  clickInsideUploadBox(): void {
    this.wasInsideUploadBox = true;
  }

  // -- Private helper methods --

  // Catch click anywhere in our page (in and out of upload profile image box)
  @HostListener('document:click')
  private clickOutside(): void {
    if (!this.wasInsideUploadBox)
      this.uploadingProfileImage = false;
    this.wasInsideUploadBox = false;
  }

  // Fetch user with 'username' from server/database
  private getUser(username: string): void {
    // Fetch users data from server
    this.alert = { message: 'Please wait while downloading users data.', type: 'warning' };
    this.userService.getUser(username)
      .subscribe((user: UserModel) => {
        this.user = user;
        // Initialize/Prefill profile Form with received users data
        this.profileForm = this.initProfileForm();
        this.alert = undefined;
      }, (err: any) => {
        if (err.error.code) {
          // If there is an error.code in err, we received error message from the server
          this.alert = { message: err.error.message, type: 'danger' };
        } else {
          // Otherwise, client couldn't establish connection to the server
          this.alert = { message: 'Error communicating with the server. Please try again later.', type: 'danger' };
          this.serverConnectionError = true;
        }
      });
  }

  // Get local time in a user friendly format
  private getLocalTime(utcDate: string | undefined): string {
    if (!utcDate)
      return '';
    const date = new Date(utcDate);
    return date.toLocaleDateString('en-US', { day: 'numeric' }) + ' ' + date.toLocaleDateString('en-US', { month: 'long' }) +
      ' ' + date.toLocaleDateString('en-US', { year: 'numeric' }) + ' - ' + date.toLocaleTimeString().toLowerCase();
  }

  // Initialize profile form from user object
  private initProfileForm(): FormGroup {
    const form = new FormGroup({
      username: new FormControl({ value: this.user?.username, disabled: true }),
      password: new FormControl({ value: '****', disabled: true }, Validators.required),
      role: new FormControl({ value: this.user?.role ? this.user?.role[0].toUpperCase() + this.user?.role?.substr(1).toLowerCase() : '', disabled: true }),
      firstName: new FormControl({ value: this.user?.firstName, disabled: true }, [Validators.required, Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,\\-\' ]{2,50}$')]),
      lastName: new FormControl({ value: this.user?.lastName, disabled: true }, [Validators.required, Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,\\-\' ]{2,50}$')]),
      email: new FormControl({ value: this.user?.email, disabled: true }, [Validators.required, Validators.email, Validators.maxLength(50)]),
      phone: new FormControl({ value: this.user?.phone, disabled: true }, Validators.pattern('^[0-9]{10,15}$')),
      country: new FormControl({ value: this.user?.country, disabled: true }, Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,&()\\-\' ]{3,100}$')),
      city: new FormControl({ value: this.user?.city, disabled: true }, Validators.pattern('^[a-zA-Zα-ωΑ-Ω.,&()\\-\' ]{3,50}$')),
      address: new FormControl({ value: this.user?.address, disabled: true }, Validators.pattern('^[a-zA-Zα-ωΑ-Ω0-9.,&()\\-\' ]{3,50}$')),
      joinDate: new FormControl({ value: this.getLocalTime(this.user?.joinDate), disabled: true })
    });
    return form;
  }

  // Update user in server/database - a user can update only his own profile
  private updateUser(updatedUser: UserModel): void {
    // Set a warning message to inform user his profile is being updated
    this.alert = { message: 'Please wait while your profile is being updated.', type: 'warning' }
    // Call service method to update user
    this.userService.updateUser(updatedUser).subscribe(
      () => {
        // No need to do anything here (user updated successfully)
      }, (err: any) => {
        if (err.error.code) {
          // If we receive an error message from the server, display that
          this.alert = { message: err.error.message, type: 'danger' };
        } else {
          // If we didn't receive any error message from the server, it means client couldn't reach server
          this.alert = { message: 'Error communicating with the server. Please try again later.', type: 'danger' };
        }
      }, () => {
        // Toggle editing off after saving updates
        this.toggleEditing();
        // Upon successful completion of the request
        this.alert = { message: 'Profile changes were saved successfully.', type: 'success' };
      }
    );
  }

  // Fetch profile image of user with 'username' from server/database
  private getProfileImage(username: string): void {
    this.profileImageLoading = true;
    // Fetch users profile image
    this.userService.downloadProfileImage(username)
      .subscribe((profileImage: Blob) => {
        this.profileImage = profileImage;
        // Profile image loaded - set loading status to false
        this.profileImageLoading = false;
      }); // In case of error getting the image do nothing
  }

}
