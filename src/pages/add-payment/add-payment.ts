import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, ActionSheetController,ViewController, NavParams } from 'ionic-angular';
import { Response } from '@angular/http';
import { AppGlobals } from '../../services/appglobals';
import { AppServer } from '../../services/appserver';
import { UiHelper } from '../../services/uihelper';
import { DomSanitizer } from '@angular/platform-browser';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';

@Component({
  selector: 'page-add-payment',
  templateUrl: 'add-payment.html'
})
export class AddPaymentPage {

    private paypalClientId: string = "AYI3I-2jeFuuqrhgpLGU6g4iVDy8gdhLw8oRzEWpUm3uJ6w85O4uyuLIssADfKLPwnSVl_eARyo9TYmi";

    private loader: any = null;
    private card:any={user_id:'',card_holder:'',card_number:'',expiry:'',cvv:'',check_terms: false,check_refund: false};

    private totalPrice: string = '2';
    private paymentDescription: string = 'Package upgrade';
    private paymentId: string = '';

    private packageToPay: any = null;

    constructor(private sanitizer:DomSanitizer,public viewCtrl: ViewController,public navCtrl: NavController,public navParams: NavParams,public globals: AppGlobals,public modalCtrl: ModalController,public loadingCtrl: LoadingController,public server: AppServer,public uiHelper: UiHelper,public actionSheetCtrl: ActionSheetController,private payPal: PayPal) {
        this.card.user_id=this.globals.currentUser.id;
        this.packageToPay=this.navParams.get('package');
    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    ionViewDidLoad(){
        console.log("AddPaymentPage -> ionViewDidLoad");
        let that=this;
    }

    doPaypalPayment(){

        let that=this;

        that.totalPrice='1';
        that.paymentDescription='Payment method update';
        if (that.packageToPay!=null){
            that.totalPrice=that.packageToPay.price;
            that.paymentDescription='Package upgrade to '+that.packageToPay.name;
        }

        this.payPal.init({
            PayPalEnvironmentProduction: 'YOUR_PRODUCTION_CLIENT_ID',
            PayPalEnvironmentSandbox: this.paypalClientId
          }).then(() => {
            // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
            this.payPal.prepareToRender('PayPalEnvironmentSandbox', new PayPalConfiguration({
              // Only needed if you get an "Internal Service Error" after PayPal login!
              //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
            })).then(() => {
                let payment = new PayPalPayment(that.totalPrice, 'USD', that.paymentDescription, 'sale');
                this.payPal.renderSinglePaymentUI(payment).then((resp) => {
                    // Successfully paid
          
                    // Example sandbox response
                    //
                    // {
                    //   "client": {
                    //     "environment": "sandbox",
                    //     "product_name": "PayPal iOS SDK",
                    //     "paypal_sdk_version": "2.16.0",
                    //     "platform": "iOS"
                    //   },
                    //   "response_type": "payment",
                    //   "response": {
                    //     "id": "PAY-1AB23456CD789012EF34GHIJ",
                    //     "state": "approved",
                    //     "create_time": "2016-10-03T13:33:33Z",
                    //     "intent": "sale"
                    //   }
                    // }
                    //alert("Paid: "+JSON.stringify(resp));
                    //that.uiHelper.showMessageBox("Paid successfully","Payment ID: "+);
                    try{
                        //alert("Payment id: "+resp.response.id);
                        that.uiHelper.showMessageBox("Paid successfully","Payment ID: "+resp.response.id);
                        that.paymentId=resp.response.id;
                    }catch(e){
                        //that.viewCtrl.dismiss();
                        that.uiHelper.showMessageBox("Error",e.message);
                    }
                }, (err) => {
                    // Error or render dialog closed without being successful
                    //that.viewCtrl.dismiss();
                    that.uiHelper.showMessageBox("Error","Payment not successful: "+err);
                });
            }, (err) => {
                // Error in configuration
                //that.viewCtrl.dismiss();
                that.uiHelper.showMessageBox("Error","Configuration error: "+err);
            });
        }, (err) => {
            // Error in initialization, maybe PayPal isn't supported or something else
            //that.viewCtrl.dismiss();
            //alert("Error initializing paypal: "+err);
            that.uiHelper.showMessageBox("Error","Initialization error: "+err);
        });
    }

    updateClick(){
        if (this.card.card_holder.trim()==''){
            this.uiHelper.showMessageBox("Error","Please enter card holder name");
            return;
        }
        if (this.card.card_number.trim()==''){
            this.uiHelper.showMessageBox("Error","Please enter card number");
            return;
        }
        if (this.card.cvv.trim()==''){
            this.uiHelper.showMessageBox("Error","Please enter card cvv");
            return;
        }
        if (!this.card.check_terms){
            this.uiHelper.showMessageBox("Error","Please agree to the terms of use");
            return;
        }
        if (!this.card.check_refund){
            this.uiHelper.showMessageBox("Error","Please agree to the refund policy");
            return;
        }
        this.doUpdateProfile();
    }

    paypalClick(){
        if (!this.card.check_terms){
            this.uiHelper.showMessageBox("Error","Please agree to the terms of use");
            return;
        }
        if (!this.card.check_refund){
            this.uiHelper.showMessageBox("Error","Please agree to the refund policy");
            return;
        }
        //open paypal
        this.doPaypalPayment();
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
            //let registerData=jsonRes.user;
            this.viewCtrl.dismiss(this.card);
        }
    }

    profileFailure(error: any){
        console.log("profileFailure");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        this.uiHelper.showMessageBox('Error',JSON.stringify(error));
    }

    doUpdateProfile(){
        console.log("doUpdateProfile");
        let that=this;
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        that.server.saveCreditCard(this.card).subscribe(
            res=>that.profileSuccess(res),err=>that.profileFailure(err)
        );
    }

    openTermsAgreement(){
        //https://www.websitepolicies.com/policies/view/yEYlFS44
        window.open('https://www.websitepolicies.com/policies/view/yEYlFS44','_blank');
    }

    openRefundPolicy(){
        //https://www.websitepolicies.com/policies/view/kWadjSbc
        window.open('https://www.websitepolicies.com/policies/view/kWadjSbc','_blank');
    }
}
