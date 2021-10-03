import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserLocalStorageService } from '../shared/user-local-storage.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {

  constructor(private router: Router, private userLocalStorageService: UserLocalStorageService) { }

  ngOnInit(): void {
    const username: string = this.userLocalStorageService.username;
    if (!username) {
      // If user is not authenticated, redirect him to the homepage
      this.router.navigate([`/`]);
    } else {
      // If user is authenticated, redirect him to his profile
      this.router.navigate([`profile/${username}`]);
    }
  }

}
