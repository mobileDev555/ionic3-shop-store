import { Component } from '@angular/core';
import { NavController, LoadingController, ModalController } from 'ionic-angular';
import { Response } from '@angular/http';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { AppGlobals } from '../../services/appglobals';
import { AppServer } from '../../services/appserver';
import { UiHelper } from '../../services/uihelper';
import { AddPaymentPage } from '../add-payment/add-payment';

@Component({
    selector: 'page-profile',
    templateUrl: 'profile.html'
})
export class ProfilePage {

    private user:any={};
    private myStores:any[] = [];
    private loader:any = null;
    
    constructor(public navCtrl: NavController,public modalCtrl: ModalController,public globals: AppGlobals,public server: AppServer,public loadingCtrl: LoadingController,public uiHelper: UiHelper) {
    }

    ionViewDidEnter(){
        this.user=this.globals.getUser();
    }

    ionViewDidLoad(){
        console.log("ProfilePage -> ionViewDidLoad");
        this.user=this.globals.getUser();
        this.loadProfile();
    }

    profileSuccess(res: Response){
        console.log("profileSuccess");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        let jsonRes=res.json();
  		console.log(JSON.stringify(jsonRes));
        if (jsonRes.status!=200){
            this.uiHelper.showMessageBox('Error',jsonRes.msg);
        }else{
            let registerData=jsonRes.user;
            let mstores=jsonRes.my_stores;
            if (mstores){
                this.myStores=[];
                for (let a=0;a<mstores.length;a++){
                    let nt=mstores[a];
                    this.myStores.push(nt);
                }
            }
        }
    }

    profileFailure(error: any){
        console.log("profileFailure");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        this.uiHelper.showMessageBox('Error',JSON.stringify(error));
    }

    loadProfile(){
        console.log("loadProfile");
        let that=this;
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        that.server.getPublicProfile(this.user.id,this.user.id).subscribe(
            res=>that.profileSuccess(res),err=>that.profileFailure(err)
        );
    }

    rightIconClick(){
        this.navCtrl.push(EditProfilePage);
    }

    storeClick(st){
        console.log("storeClick: "+st.store_name);
    }

    changePaymentClick(){
        console.log("changePaymentClick");
        let that=this;
        let mdl=this.modalCtrl.create(AddPaymentPage);
        mdl.onDidDismiss((data)=>{
            if (data){
                that.uiHelper.showMessageBox("","Payment method updated successfully");
            }
        });
        mdl.present();
    }

    historyClick(){
        console.log("historyClick");
    }
}
