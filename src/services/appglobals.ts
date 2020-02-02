import {Injectable} from "@angular/core";
import { AppServer } from './appserver';
import { Platform } from "ionic-angular";

@Injectable() export class AppGlobals {

    //public mapsApiKey: string = "AIzaSyCFOiN9JZFxc1K5wNbugBlqaYBw1VZpu0E";
    public mapsApiKey: string = "AIzaSyCx2nQyUDGsS4E-2m1-ftGit8jAeMNTLsQ"; //karen's account

    public packageLight: string = 'light';
    public packageMedium: string  = 'medium';
    public packagePremium: string = 'premium';

    public packages:any[]=[{id: this.packageLight,name: "Basic",images:5,videos:0,price: 49.99,backColor:'#7927ea',buttonBackColor:'#41147f'}
                            ,{id: this.packageMedium,name: "Fancy",images:10,videos:0,price: 79.99,backColor:'#0d64db',buttonBackColor:'#073472'}
                            ,{id: this.packagePremium,name: "Premium",images:15,videos:1,price: 99.99,backColor:'#19a403',buttonBackColor:'#0d5702'}];

    /*public packages:any[]=[{id: this.packageLight,name: "Basic",images:5,videos:0,price: 1,backColor:'#7927ea',buttonBackColor:'#41147f'}
                            ,{id: this.packageMedium,name: "Fancy",images:10,videos:0,price: 2,backColor:'#0d64db',buttonBackColor:'#073472'}
                            ,{id: this.packagePremium,name: "Premium",images:15,videos:1,price: 3,backColor:'#19a403',buttonBackColor:'#0d5702'}];*/

    public currentUser:any=null;
    public currentLocation:any=null;

    constructor(public server: AppServer,public platform: Platform){
    }

    public shareTheApp(){
        try{
            let msg="Find weed now.\r\nDownload Where's Da Weed (Like Weedmaps but better)";
            let lnk="";
            if(this.platform.is('android')){
                lnk="https://play.google.com/store/apps/details?id=com.wheresdaweed";
            }else{
                
            }
            (<any>window).plugins.socialsharing.share(msg, null, null,lnk);
        }catch(e){
            alert(e.message);
        }
    }

    public isValidEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    public getPasswordValidation(pwd){
        let vals={six_chars_long:false,has_letter:false,has_number:false};
        if (pwd.length>=6){
            vals.six_chars_long=true;
        }
        for (let a=0;a<pwd.length;a++){
            if ((pwd[a]>='a' && pwd[a]<='z') || (pwd[a]>='A' && pwd[a]<='Z')){
                vals.has_letter=true;
            }
            if ((pwd[a]>='0' && pwd[a]<='9')){
                vals.has_number=true;
            }
        }

        return vals;
    }

    public getCurrentLocation(){
        return this.currentLocation;
    }

    public setUser(usr){
        (<any>window).localStorage.wheredaweedUser=JSON.stringify(usr);
    }

    public getUser(){
        let usr=(<any>window).localStorage.wheredaweedUser;
        if (usr){
            if (usr=="null"){
                return null;
            }
            return JSON.parse(usr);
        }
        return null;
    }
}