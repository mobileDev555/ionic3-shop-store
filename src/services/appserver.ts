/* * * ./app/comments/services/comment.service.ts * * */
// Imports
import { Injectable,ReflectiveInjector } from '@angular/core';
import { Http, Response, Headers, RequestOptions,BaseRequestOptions} from '@angular/http';
import { XHRBackend,BrowserXhr } from '@angular/http';
import { ResponseOptions,BaseResponseOptions,ConnectionBackend } from '@angular/http';
import { XSRFStrategy,CookieXSRFStrategy } from '@angular/http';

//import {Observable} from 'rxjs/Rx';
//Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class AppServer {
    
    //private BASE_URL="http://localhost:9100/wheredaweed/api/";
    //private BASE_URL="http://rameezusmani.com/wheredaweed/api/";
    //private BASE_URL="http://192.168.8.100:9100/wheredaweed/api/";
    private BASE_URL="http://jadedss.com/wheresdaweed/api/";

    // Resolve HTTP using the constructor
    constructor (private http: Http) {}

    getNewHttpInstance(){
        let injector = ReflectiveInjector.resolveAndCreate([
            Http,
            BrowserXhr,
            {provide: RequestOptions, useClass: BaseRequestOptions},
            {provide: ResponseOptions, useClass: BaseResponseOptions},
            {provide: ConnectionBackend, useClass: XHRBackend},
            {provide: XSRFStrategy, useFactory: () => new CookieXSRFStrategy()},
        ]);
        //return injector.get(Http);
        return injector.resolveAndInstantiate(Http);
    }

    //this app url

    getMapPinUrl(pcolor){
        return this.BASE_URL+"media/pin-"+pcolor+".png";
    }

    getImageSaveUrl(){
        return this.BASE_URL+"save_image.php";
    }

    getShareUrl(){
        return this.BASE_URL+"generate_share_data.php";
    }

    register(registerData) {
    	console.log("register");
        let bodyString = "name="+encodeURI(registerData.name)
        bodyString+="&password="+encodeURI(registerData.password);
        bodyString+="&email="+encodeURI(registerData.email);
        bodyString+="&image_url="+encodeURI(registerData.image_url);
        bodyString+="&facebook_profile_id="+encodeURI(registerData.facebook_profile_id);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url=this.BASE_URL+"wdw_register.php";
        return this.http.post(url, bodyString, options);
    }

    login(loginData) {
    	console.log("login");
        let bodyString = "password="+encodeURI(loginData.password);
        bodyString+="&email="+encodeURI(loginData.email);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url=this.BASE_URL+"login.php";
        return this.http.post(url, bodyString, options);
    }

    forgotPassword(loginData) {
    	console.log("forgotPassword");
        let bodyString = "email="+encodeURI(loginData.email);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url=this.BASE_URL+"forgot_password.php";
        return this.http.post(url, bodyString, options);
    }

    getHomeFeed(data){
        console.log("getHomeFeed");
        let url=this.BASE_URL+"get_home_feed.php";
        url+="?user_id="+encodeURI(data.user_id);
        console.log(url);
        let headers = new Headers({ });
        let options = new RequestOptions({ headers: headers });
        let http2=this.http;
        return http2.get(url,options);
    }

    getPublicProfile(profileId,userId){
        console.log("getPublicProfile");
        let url=this.BASE_URL+"get_public_profile.php?profile_id="+profileId;
        url+="&user_id="+userId;
        url+="&x="+(new Date().getTime());
        console.log(url);
        let headers = new Headers({  }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let http2=this.http;
        return http2.get(url,options);
    }

    updateProfile(registerData) {
    	console.log("updateProfile");
        let bodyString = "name="+encodeURI(registerData.name);
        bodyString+="&image_url="+encodeURI(registerData.image_url);
        bodyString+="&email="+encodeURI(registerData.email);
        bodyString+="&new_password="+encodeURI(registerData.new_password);
        bodyString+="&user_id="+encodeURI(registerData.id);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url=this.BASE_URL+"update_profile.php";
        let http2=this.http;
        return http2.post(url,bodyString,options);
    }

    updatePackage(registerData) {
    	console.log("updatePackage");
        let bodyString = "package_id="+encodeURI(registerData.package_id);
        bodyString+="&user_id="+encodeURI(registerData.user_id);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url=this.BASE_URL+"update_package.php";
        let http2=this.http;
        return http2.post(url,bodyString,options);
    }

    claimStore(registerData) {
    	console.log("claimStore");
        let bodyString = "store_id="+encodeURI(registerData.store_id);
        bodyString+="&user_id="+encodeURI(registerData.user_id);
        bodyString+="&web_url="+encodeURI(registerData.web_url);
        bodyString+="&description="+encodeURI(registerData.description);
        bodyString+="&image_url="+encodeURI(registerData.image_url);
        bodyString+="&delivery="+encodeURI(registerData.delivery);
        bodyString+="&delivery_timings="+encodeURI(registerData.delivery_timings);
        bodyString+="&store_timings="+encodeURI(registerData.store_timings);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url=this.BASE_URL+"claim_store.php";
        let http2=this.http;
        return http2.post(url,bodyString,options);
    }

    saveCreditCard(registerData) {
    	console.log("saveCreditCard");
        let bodyString = "card_holder="+encodeURI(registerData.card_holder);
        bodyString+="&user_id="+encodeURI(registerData.user_id);
        bodyString+="&card_number="+encodeURI(registerData.card_number);
        bodyString+="&expiry="+encodeURI(registerData.expiry);
        bodyString+="&cvv="+encodeURI(registerData.cvv);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option
        let url=this.BASE_URL+"save_credit_card.php";
        let http2=this.http;
        return http2.post(url,bodyString,options);
    }

    getCountries(){
        console.log("getCountries");
        //let url="assets/countries.json.txt";
        let url="assets/countries_new.json";
        console.log(url);
        return this.http.get(url);
    }

    getProvinces(){
        console.log("getProvinces");
        //let url="assets/provinces.json.txt";
        let url="assets/provinces_new.json";
        console.log(url);
        return this.http.get(url);
    }

    getAddressInfo(addr,apiKey){
        console.log("getAddressInfo");
        let url="http://maps.googleapis.com/maps/api/geocode/json?address="+encodeURI(addr)+"&key="+apiKey;
        console.log(url);
        return this.http.get(url);
    }

    getLatLngInfo(addr,apiKey){
        console.log("getLatLngInfo");
        let url="https://maps.googleapis.com/maps/api/geocode/json?latlng="+addr.lat+","+addr.lng+"&key="+apiKey;
        console.log(url);
        return this.http.get(url);
    }

    getStreetViewImage(addr,apiKey){
        console.log("getStreetViewImage");
        let url="https://maps.googleapis.com/maps/api/streetview?size=600x300&location="+addr.latitude+","+addr.longitude+"&heading=151.78&pitch=0&key="+apiKey;
        console.log(url);
        return this.http.get(url);
    }

    updateUserLocation(registerData) {
    	console.log("updateUserLocation");
        let bodyString = "user_id="+encodeURI(registerData.user_id)+"&latitude="+encodeURI(registerData.latitude);
        bodyString+="&longitude="+encodeURI(registerData.longitude);
        console.log(bodyString);
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = new RequestOptions({ headers: headers });
        let url=this.BASE_URL+"update_location.php";
        let http2=this.http;
        return http2.post(url,bodyString,options);
    }
}