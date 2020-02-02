import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { AppGlobals } from '../../services/appglobals';
import { HomePage } from '../home/home';
import { SignupPage } from '../signup/signup';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
    selector: 'page-splash',
    templateUrl: 'splash.html'
})
export class SplashPage {

    constructor(public navCtrl: NavController,public events: Events,public globals: AppGlobals,public geolocation: Geolocation) {

    }

    ionViewDidLoad(){
        let that=this;
        this.doLocationThing();
        let currUser=that.globals.getUser();
        that.globals.currentUser=currUser;
        setTimeout(function(){
            if(that.globals.currentUser==null){
            }else{
                that.navCtrl.setRoot(HomePage);
            }
        },2000);
        
    }

    doLocationThing(){
        try{
            let that=this;
            this.geolocation.getCurrentPosition().then((resp) => {
                console.log("Location: "+resp.coords.latitude+","+resp.coords.longitude);
                that.globals.currentLocation=resp.coords;
                that.events.publish('location_changed');
            }).catch((error) => {
                console.log('Error getting location', error);
            });

            let watch = this.geolocation.watchPosition();
            watch.subscribe((data) => {
                if (data.coords){
                    console.log("Watch Location: "+data.coords.latitude+","+data.coords.longitude);
                    that.globals.currentLocation=data.coords;
                    that.events.publish('location_changed');
                }
            });
        }catch(e){
            console.log("Error: "+e.message);
        }
    }

    searchClick(){
        console.log("searchClick");
        if (this.globals.currentUser==null){
            this.navCtrl.push(HomePage);
        }else{
            this.navCtrl.setRoot(HomePage);
        }
        
    }

    loginClick(){
        console.log("loginClick");
        this.navCtrl.push(LoginPage);
    }

    signupClick(){
        console.log("signupClick");
        this.navCtrl.push(SignupPage);
    }

    forgotPasswordClick(){
        console.log("forgotPasswordClick");
        this.navCtrl.push(ForgotPasswordPage);
    }

    shareClick(){
        this.globals.shareTheApp();
    }
}
