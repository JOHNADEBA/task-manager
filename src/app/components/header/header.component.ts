import { Component, Renderer2, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UtilService } from '../../globalServices/utils/util.service';
import { AuthService } from '../../globalServices/auth/auth.service';
import { Observable } from 'rxjs';

type MenuItems = {
  label: string;
  link: string;
  authRequired: boolean;
};

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isSidenavOpen: boolean = false;
  loggedIn$!: Observable<boolean>;
  isDesktop$!: Observable<boolean>;
  isDarkMode: boolean = false;
  menuItems: MenuItems[] = [
    { label: 'Login', link: '/login', authRequired: false },
    { label: 'Sign Up', link: '/sign-up', authRequired: false },
    { label: 'Dashboard', link: '/dashboard', authRequired: true },
    { label: 'Tasks', link: '/tasks', authRequired: true },
    { label: 'Settings', link: '/settings', authRequired: true },
  ];

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    protected utilService: UtilService
  ) {}
  ngOnInit() {
    this.loggedIn$ = this.authService.loggedIn$;

    this.authService.getUser$().subscribe((user) => {
      this.isDarkMode = user ? user.isDarkMode : false;
    });
    this.getBodyBgColor();
  }

  getBodyBgColor(): string {
    if (this.utilService.isBrowser()) {
      const bgColor = window
        .getComputedStyle(document.body, null)
        .getPropertyValue('background-color');

      if (bgColor === 'rgba(180, 173, 173, 0.1)') {
        return 'rgb(241, 238, 238)';
      }
      return bgColor;
    }
    return 'inherit';
  }

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
    if (this.isSidenavOpen) {
      this.renderer.addClass(document.body, 'menu-open');
    } else {
      this.renderer.removeClass(document.body, 'menu-open');
    }
  }

  closeSidebar() {
    this.isSidenavOpen = false;
    this.renderer.removeClass(document.body, 'menu-open');
  }
}
