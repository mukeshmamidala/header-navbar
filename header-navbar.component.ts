import { Component, OnInit, ElementRef, Renderer2  } from '@angular/core';
import { labelValues, textMessages } from '../../enums/constants';
import { configurations } from '../../enums/epm-constants';
import { routePathNames } from '../../enums/route-path-names';
import { Router } from '@angular/router';
import { EntitlementService } from '../../services/shared/entitlement.service';
import { httpUrlPathList } from '../../enums/http-url-paths';
import { HttpRequestsService } from '../../services/common/http-requests.service';
import { Subscription } from 'rxjs/Rx';
import { quotationTypes } from '../../enums/quotations-constants';

@Component({
	selector	: 'rates-top-header',
	templateUrl : './header.component.html',
	providers: [HttpRequestsService]
})
export class HeaderComponent implements OnInit {

	public isActive : boolean;
	public headerTabList  : Array<string> = [];
	public selectedHeaderTabIndex : number;
	public countryList : Array<string>;
	public selectedCountry : string;
	public currentSelectedHeaderTabName : string;
	public ldapUsersInfo : any;
	public loadingImage: Subscription;
	public isPopupForFetchLDAPUserInfoHidden : boolean;
	public titleForFetchLDAPUserInfoErrorPopup : string;
	public messageForFetchLDAPUserInfoErrorPopup : string;
	public entitlementData:any;
	public menuList:any[];

	public buttonsForFetchLDAPUserInfoErrorPopup: Array<Object> = [
	    {
			name: 'OK',
			className: 'rates-error-popup-confirm-button',
			callback: (event: Event) => {
				event.preventDefault();
				this.cancelEventActionOnFetchLDAPUserInfoErrorPopup();
			},
			isPrimary: true
	    }

   	];

	constructor(public router: Router,
				public elementRef : ElementRef,
				public rendererRef : Renderer2,
				public entitlementServObj : EntitlementService,
				public httpReqService: HttpRequestsService ) {
	}

	ngOnInit() {
		this.entitlementData = this.entitlementServObj.getEntitlementData();
		this.menuList = this.entitlementData[sessionStorage.getItem('loggedInUserCountryCode')].functions
		this.intializeData();
		this.showNavBar();
	}


	intializeData(){
		let entitlementData : any;
		entitlementData = this.entitlementServObj.getEntitlementData();
		this.currentSelectedHeaderTabName = "";
		this.headerTabList = [];
		this.headerTabList.push((entitlementData && entitlementData['appName']));
		this.selectedHeaderTabIndex = 0;
		this.countryList = this.entitlementServObj.getEntitlementLocationList();
		this.selectedCountry = sessionStorage.getItem('loggedInUserCountryCode');
		this.titleForFetchLDAPUserInfoErrorPopup = "";
		this.isPopupForFetchLDAPUserInfoHidden = true;
		this.messageForFetchLDAPUserInfoErrorPopup = "";
	}

	showNavBar(){
		if("true" == sessionStorage.getItem('loggedInUser')){
			let addressBarUrl = sessionStorage.getItem('addressBarUrl');
			sessionStorage.setItem('currentSelectedAppName', this.headerTabList[this.selectedHeaderTabIndex]);
			if('/' == addressBarUrl){
				this.selectedHeaderTabIndex = 0;
				this.selectedHeaderTab(null,this.selectedHeaderTabIndex,sessionStorage.getItem('currentSelectedAppName') );
			}
			else{
				this.findSelectedHeaderTabIndexBasedOnUrl(addressBarUrl);
			}

		}

	}

	ngAfterViewChecked(){

		// if( this.elementRef &&
		// 	this.elementRef.nativeElement &&
		// 	this.elementRef.nativeElement.querySelector('.country-icon:hover')){
				this.setSelectedCountryImage();
		//}
	}

	showLocationList(){
		console.log("In showLocationList method of HeaderComponent");
		let locationListRef : any;
		if(document.body.querySelector('.expand-country-menu') &&
		   ('none' == window.getComputedStyle( document.body.querySelector('.expand-country-menu')).display)){
			if( document.body.firstElementChild &&
				document.body.firstElementChild.lastChild &&
				document.body.firstElementChild.lastChild['classList'] &&
				document.body.firstElementChild.lastChild['classList']['value'] == 'expand-country-menu'){
					document.body.querySelector('.expand-country-menu').setAttribute('style', 'display:flex');
			}
			else{
				locationListRef =  document.body.querySelector('.expand-country-menu');
				locationListRef.setAttribute('style', 'display:flex');
				this.rendererRef.appendChild(document.body.firstElementChild, locationListRef);
			}
		}
	}

	hideLocationList(){
		console.log("In hideLocationList method of HeaderComponent");
		if(document.body.querySelector('.expand-country-menu') &&
		   ('flex' == window.getComputedStyle( document.body.querySelector('.expand-country-menu')).display)){
			document.body.querySelector('.expand-country-menu').setAttribute('style', 'display:none');
		}
	}

	setSelectedCountryImage(){

		if( this.elementRef &&
			this.elementRef.nativeElement &&
			this.elementRef.nativeElement.querySelector('.country-icon') &&
			((undefined != sessionStorage.getItem('loggedInUserSelectedCountryImage')) ||
			('' != sessionStorage.getItem('loggedInUserSelectedCountryImage') ))){

			let countryIconRef : any;
			countryIconRef	= 	this.elementRef.nativeElement.querySelector('.country-icon');
			countryIconRef.setAttribute('style','background:'+ sessionStorage.getItem('loggedInUserSelectedCountryImage')+';background-size: contain;');
		}
	}

	selectedHeaderTab(evtObj, selectedHeaderTabIndex, selectedHeaderTabName){
		console.log("In selectedHeaderTab method of HeaderComponent");

		if(this.currentSelectedHeaderTabName != selectedHeaderTabName){
			this.currentSelectedHeaderTabName = selectedHeaderTabName;
			this.selectedHeaderTabIndex = selectedHeaderTabIndex;
			let urlPathForNavBarMenu : string;
			let urlForMainContent :string = null;
			if(this.menuList && this.menuList.length) {
				urlForMainContent = labelValues.DEFAULT_APP_NAME+'/'+ this.menuList[0];
			} 
			urlPathForNavBarMenu = 	routePathNames.EPM_NAVBAR + "/" + selectedHeaderTabName;
			this.router.navigate([{ outlets: { maincontent: urlForMainContent, menucontent: urlPathForNavBarMenu}}]);
		}
	}

	onClickLogout(evtObj){
		console.log("In onClickLogout of HeaderComponent");
		evtObj.preventDefault();
		let urlPathToDisplayHeader = routePathNames.LOGIN_HEADER;
		let urlPathToDisplayLoginPage = routePathNames.LOGIN_PAGE;

		let appLaunchUrlValue : string, userAccessTypeValue : string;
		appLaunchUrlValue = sessionStorage.getItem('appLaunchUrl');
		userAccessTypeValue = sessionStorage.getItem('isUserAccessTypeMatched');

		sessionStorage.clear();

		if(0==sessionStorage.length){
			if( document.body.firstElementChild &&
				document.body.firstElementChild.lastChild &&
				document.body.firstElementChild.lastChild['classList'] &&
				document.body.firstElementChild.lastChild['classList']['value'] == 'expand-country-menu'){
					let locationListRef : any;
					locationListRef =  document.body.querySelector('.expand-country-menu');
					this.rendererRef.removeChild(document.body.firstElementChild, locationListRef);
			}
			if('true' != userAccessTypeValue){

					this.router.navigate(
								[{
									outlets:
												{   loginHeadercontent: urlPathToDisplayHeader,
													primary: urlPathToDisplayLoginPage ,
													menucontent : null,
													maincontent: null
												}}],
									{ queryParams:
												{
													returnUrl: null
												}
									});
			}
			else{
				window.location.href = appLaunchUrlValue;
			}
		}
	}

	findSelectedHeaderTabIndexBasedOnUrl(addressBarUrl){
		console.log(addressBarUrl);
		let headerTabListLength : number;
		headerTabListLength = (this.headerTabList && this.headerTabList.length);
		console.log(headerTabListLength);
		let decodedAddressBarUrl : string;
		decodedAddressBarUrl = decodeURIComponent(addressBarUrl);


		for(let counter = 0; headerTabListLength > counter; counter++){
			if(-1 != decodedAddressBarUrl.indexOf(routePathNames.EPM_NAVBAR + '/' + this.headerTabList[counter])){
				this.selectedHeaderTabIndex = counter;
				this.currentSelectedHeaderTabName = this.headerTabList[counter];
				break;
			}
		}

		console.log(this.selectedHeaderTabIndex);
	}

	onChangeCountry(evtObj, countrySelected){
		console.log("In onChangeCountry of Header Component");
		evtObj.preventDefault();
		console.log("Selected country" + countrySelected);
		//this.selectedCountry = countrySelected;
		let countryCodeSelected = this.getCountryCode(countrySelected);

		let backgroundImageUrl : any, tempUrlPath:any;

		if(''!=countryCodeSelected){

			tempUrlPath = '../'+ process.env.APP_PREFIX +'assets/img/'+ countryCodeSelected + '.png';
			backgroundImageUrl = 'url('+tempUrlPath+') center center no-repeat';
			sessionStorage.setItem('loggedInUserSelectedCountryImage',backgroundImageUrl );


			if(countryCodeSelected == sessionStorage.getItem('loggedInUserCountryCode')){
				console.log("Same country selected");
			}
			else{
				sessionStorage.setItem('isUserChangedCountry', 'true');
				sessionStorage.setItem('loggedInUserCountryCode', countryCodeSelected);
				window.location.reload(true);
			}
		}
		else{

			backgroundImageUrl = "url('../'"+ process.env.APP_PREFIX +"'assets/img/Ic_country_sg_large.png') center center no-repeat;"
			sessionStorage.setItem('loggedInUserSelectedCountryImage', backgroundImageUrl );
		}

	}

	getCountryCode(country : string) : string{
		let entitlementData : any;
		entitlementData = this.entitlementServObj.getEntitlementData();

		switch(country){
			case 'Dubai' : return 'AE';
			case 'Australia' : return 'AU';
			case 'China' : return 'CN';
			case 'Hong Kong' : return 'HK';
			case 'Indonesia' : return 'ID';
			case 'India' : return 'IN';
			case 'Japan' : return 'JP';
			case 'Korea' : return 'KR';
			case 'Labuan' : return 'MY';
			case 'Singapore' : return 'SG';
			case 'Taiwan' : return 'TW';
			case 'United Kingdom' : {
				if(entitlementData['appName'] === 'NON-FTP') {
					return 'GB'
				}
				return 'UK';
			}
			case 'Vietnam': return 'VN';
      case 'Macau' : return 'MO';
      case 'Hong Kong Branch' : return 'HB';
		}
		return '';
	}

	cancelEventActionOnFetchLDAPUserInfoErrorPopup(){
		console.log("In cancelEventActionOnFetchLDAPUserInfoErrorPopup of HeaderComponent");
		this.isPopupForFetchLDAPUserInfoHidden = true;
		this.messageForFetchLDAPUserInfoErrorPopup = "";
	}


}
