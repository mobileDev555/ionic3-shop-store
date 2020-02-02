import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Response } from '@angular/http';
import { AppGlobals } from '../../services/appglobals';
import { AppServer } from '../../services/appserver';
import { UiHelper } from '../../services/uihelper';
import { DomSanitizer } from '@angular/platform-browser';
import { AddPaymentPage } from '../add-payment/add-payment';

@Component({
  selector: 'page-upgrade-package',
  templateUrl: 'upgrade-package.html'
})
export class UpgradePackagePage {

    private user:any={};
    private loader:any=null;

    constructor(private sanitizer:DomSanitizer,public navCtrl: NavController,public globals: AppGlobals,public modalCtrl: ModalController,public loadingCtrl: LoadingController,public server: AppServer,public uiHelper: UiHelper,public actionSheetCtrl: ActionSheetController) {
        this.user=this.globals.getUser();
    }

    ionViewDidLoad(){
        console.log("UpgradePackagePage -> ionViewDidLoad");
        let that=this;
    }

    updateClick(){
        //this.doUpdateProfile();
    }

    packageSuccess(res: Response){
        console.log("packageSuccess");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        let jsonRes=res.json();
  		console.log(JSON.stringify(jsonRes));
        if (jsonRes.status!=200){
            this.uiHelper.showMessageBox('Error',jsonRes.msg);
        }else{
            //let registerData=jsonRes.user;
            //this.globals.setUser(registerData);
            //this.globals.currentUser=registerData;
            this.globals.currentUser.user_package=jsonRes.package;
            this.globals.setUser(this.globals.currentUser);
            this.uiHelper.showMessageBox("Package","Package upgrade is successful");
            this.navCtrl.pop();
        }
    }

    packageFailure(error: any){
        console.log("packageFailure");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        this.uiHelper.showMessageBox('Error',JSON.stringify(error));
    }

    doUpdatePackage(pkg){
        console.log("doUpdatePackage");
        let that=this;
        let pkgData={package_id: pkg.id,user_id: this.globals.currentUser.id};
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        that.server.updatePackage(pkgData).subscribe(
            res=>that.packageSuccess(res),err=>that.packageFailure(err)
        );
    }

    purchaseClick(pkg){
        let that=this;
        //this.globals.currentUser.user_package=pkg.id;
        //this.navCtrl.pop();
        //this.doUpdatePackage(pkg);
        let mdl=this.modalCtrl.create(AddPaymentPage,{package: pkg});
        mdl.onDidDismiss((data)=>{
            if (data){
                that.doUpdatePackage(pkg);
            }
        });
        mdl.present();
    }
}
