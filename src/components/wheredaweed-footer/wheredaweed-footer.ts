import { Component,Input,Output,EventEmitter } from '@angular/core';
import { NavController,ModalController,LoadingController,Platform,ViewController, NavParams } from 'ionic-angular';
import { UiHelper } from '../../services/uihelper';
import { Events } from 'ionic-angular';
import { AppGlobals } from '../../services/appglobals';
import { HomePage } from '../../pages/home/home';
import { AddPaymentPage } from '../../pages/add-payment/add-payment';
import { ProfilePage } from '../../pages/profile/profile';

@Component({
    selector: 'wheredaweed-footer',
    templateUrl: 'wheredaweed-footer.html'
})
export class WheredaweedFooter {

    @Input('selected-index') selectedIndex = 0;
    @Output('headerClick') headerTitleClick = new EventEmitter();

    private currentTs: string = '';

    constructor(public viewCtrl: ViewController,public navParams: NavParams,public globals: AppGlobals, public platform: Platform, public loadingCtrl: LoadingController,public modalCtrl: ModalController, public events: Events,public uiHelper: UiHelper,public navCtrl: NavController) {
        console.log("wheredaweed-footer");
        this.currentTs=(new Date().getTime()).toString();
    }

    ionViewDidLoad(){
        console.log("WheredaweedFooter: ionViewDidLoad");
    }

    getCurrentTs(){
        return this.currentTs;
    }

    setSelectedIndex(si){
        this.selectedIndex=si;
    }

    getSelectedIndex(){
        return this.selectedIndex;
    }

    tabClick(idx){
        console.log("tabClick: "+idx);
        if (idx==this.getSelectedIndex()){
            return;
        }
        if (idx==0){
            this.navCtrl.setRoot(HomePage);
        }else if(idx==1){
            this.navCtrl.setRoot(AddPaymentPage);
        }else if(idx==2){
            this.navCtrl.setRoot(ProfilePage);
        }else if(idx==3){
            //open share
            this.globals.shareTheApp();
        }
    }
}
