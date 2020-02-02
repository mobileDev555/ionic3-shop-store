import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { Response } from '@angular/http';
import { UiHelper } from '../../services/uihelper';
import { AppServer } from '../../services/appserver';
import { AppGlobals } from '../../services/appglobals';

@Component({
    selector: 'page-forgot-password',
    templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {

    private loginData:any={email:''};
    private loader: any = null;

    constructor(public navCtrl: NavController,public loadingCtrl: LoadingController,public uiHelper: UiHelper,public server: AppServer,public globals: AppGlobals) {

    }

    loginClick(){
        if(this.loginData.email.trim()=="" || !this.globals.isValidEmail(this.loginData.email)){
            this.uiHelper.showMessageBox("Error","Please enter valid email address");
            return;
        }
        this.doLogin();
    }

    loginSuccess(res: Response){
        console.log("loginSuccess");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        console.log(res.text());
        let jsonRes=res.json();
        if (jsonRes.status!=200){
            this.uiHelper.showMessageBox('Error',jsonRes.msg);
        }else{
            this.uiHelper.showMessageBox("","Email is sent with the instructions to reset your password.");
            this.navCtrl.pop();
        }
    }

    loginFailure(error: any){
        console.log("loginFailure");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        this.uiHelper.showMessageBox('Error',JSON.stringify(error));
    }

    doLogin(){
        console.log("loginClick");
        let that=this;
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        that.server.forgotPassword(this.loginData).subscribe(
            res=>that.loginSuccess(res),err=>that.loginFailure(err)
        );
    }

    closeMe(){
        this.navCtrl.pop();
    }
}
