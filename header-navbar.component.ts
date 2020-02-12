import { Component,OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { APP_CONSTANTS } from '../../constants/appConstant';
import { RichLoginService } from '../login-rich/login.service';

@Component({
  selector: 'header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrls: ['./header-navbar.component.scss']
})
export class HeaderNavbarComponent implements OnInit {
  // public isOpen = false; // toggle navbar in web view
  // public isCollapse = false; // toggle navbar in mobile view
  public appName: string;
  // public userInfo: any = {};
  // public interceptedHttp;

  constructor(private loginService: RichLoginService) {
    this.appName = APP_CONSTANTS.name;
    // this.interceptedHttp = _http;
  }
  // get userName() {
  //   const userName = this.userInfo && this.userInfo.user_name;
  //   return (userName ? userName : '');
  // }
  // get isUserLoggedIn() {
  //   return this.userName;
  // }
  // public toggleDropdown() {
  //   this.isOpen = !this.isOpen;
  // }

  // @HostListener('document:click', ['$event'])
  // public closeAll(event: any) {
  //   if (!this._eref.nativeElement.contains(event.target)) {
  //     this.isOpen = false;
  //     this.isCollapse = false;
  //   }
  // }
  public logout() {
    this.loginService.logout();
  }
  // public toggleCollapse() {
  //   this.isCollapse = !this.isCollapse;
  // }
  public ngOnInit(): void {
    this.appName = APP_CONSTANTS.name;
    // this.interceptedHttp = this._http;
    // this.loginService.getUserInfo().then((userInfo) => {
    //   this.userInfo = Object.assign({}, this.userInfo, userInfo);
    // });
  }
}
