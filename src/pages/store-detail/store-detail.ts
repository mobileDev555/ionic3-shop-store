import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { AppServer } from '../../services/appserver';
import { AppGlobals } from '../../services/appglobals';
import { UiHelper } from '../../services/uihelper';
import { Response } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController,LoadingController } from 'ionic-angular';
import { ClaimStorePage } from '../claim-store/claim-store';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-store-detail',
  templateUrl: 'store-detail.html'
})
export class StoreDetailPage {

    private store: any = null;
    private idx: string = "";

    private store_timings:any[]=[];
    private delivery_timings:any[]=[];
    
    constructor(private sanitizer:DomSanitizer, public uiHelper: UiHelper, public events: Events, public navCtrl: NavController, public navParams: NavParams,public loadingCtrl: LoadingController,public alertCtrl: AlertController, public server: AppServer, public globals: AppGlobals) {
        this.store=this.navParams.get('store');
        this.idx=(new Date().getTime()).toString();
        //this.store.store_description='This is the description of this store';
        if (this.store.has_store_timings){
            this.store_timings=JSON.parse(this.store.store_timings);
        }
        if (this.store.has_delivery_timings){
            this.delivery_timings=JSON.parse(this.store.delivery_timings);
        }
    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    ionViewDidLoad(){
    }

    callStore(st){
        window.open('tel:'+st.store_phone,'_blank');
    }

    claimClick(st){
        console.log("claimClick: "+st.store_name);
        if (this.globals.currentUser==null){
            this.navCtrl.push(LoginPage);
        }else{
            this.navCtrl.push(ClaimStorePage,{store: st});
        }
        //this.navCtrl.push(ClaimStorePage,{store: st});
    }

    websiteClick(st){
        console.log("websiteClick: "+st.store_name);
        window.open(st.web_url,'_blank');
    }
}
