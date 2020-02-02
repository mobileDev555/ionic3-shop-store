import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { Response } from '@angular/http';
import { SignupPage } from '../signup/signup';
import { UiHelper } from '../../services/uihelper';
import { AppServer } from '../../services/appserver';
import { AppGlobals } from '../../services/appglobals';
import { HomePage } from '../home/home';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {

    private loginData:any={email:'',password:''};
    private loader: any = null;

    constructor(public navCtrl: NavController,public loadingCtrl: LoadingController,public uiHelper: UiHelper,public server: AppServer,public globals: AppGlobals) {

    }

    signupClick(){
        console.log("signupClick");
        this.navCtrl.push(SignupPage);
    }

    forgotPasswordClick(){
        console.log("forgotPasswordClick");
        this.navCtrl.push(ForgotPasswordPage);
    }

    loginClick(){
        if(this.loginData.email.trim()=="" || !this.globals.isValidEmail(this.loginData.email)){
            this.uiHelper.showMessageBox("Error","Please enter valid email address");
            return;
        }
        if(this.loginData.password.trim()==""){
            this.uiHelper.showMessageBox("Error","Please enter password");
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
            let registerData=jsonRes.user;
            this.globals.setUser(registerData);
            this.globals.currentUser=registerData;
            this.navCtrl.setRoot(HomePage);
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
        that.server.login(this.loginData).subscribe(
            res=>that.loginSuccess(res),err=>that.loginFailure(err)
        );
    }

    closeMe(){
        this.navCtrl.pop();
    }
}
