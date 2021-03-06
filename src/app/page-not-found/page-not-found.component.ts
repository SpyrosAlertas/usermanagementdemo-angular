import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle(`404 Page Not Found | ${environment.appTitle}`);
  }

}
