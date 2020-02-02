import { Component,ViewChild } from '@angular/core';
import { NavController,Tabs,Platform,ViewController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { UiHelper } from '../../services/uihelper';
import { AppGlobals } from '../../services/appglobals';
import { AppServer } from '../../services/appserver';
import { Events } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { AddPaymentPage } from '../add-payment/add-payment';

@Component({
  selector: 'page-home-tab',
  templateUrl: 'home-tab.html'
})
export class HomeTabPage {

    tabHome = HomePage;
    tabProfile = ProfilePage;
    tabPayment = AddPaymentPage;
  
    private currentTs: string = '';

    @ViewChild("homeTabs") homeTabs: Tabs;

    constructor(public viewCtrl: ViewController, public platform: Platform, public events:Events, public navCtrl: NavController,private uiHelper: UiHelper,private globals: AppGlobals,public server: AppServer) {
        this.currentTs=(new Date().getTime()).toString();
    }

    tabChanged(evt: Event){
        console.log("tabChanged");
    }
}