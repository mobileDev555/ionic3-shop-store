import { Component } from '@angular/core';
import { NavController,LoadingController, Events } from 'ionic-angular';
import { Response } from '@angular/http';
import { UiHelper } from '../../services/uihelper';
import { AppServer } from '../../services/appserver';
import { AppGlobals } from '../../services/appglobals';
import { ProfilePage } from '../profile/profile';
import { ClaimStorePage } from '../claim-store/claim-store';
import { StoreDetailPage } from '../store-detail/store-detail';
import { LoginPage } from '../login/login';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    private map: any = null;
    private marker: any = null;
    private currentTs: string = '';
    private loader:any = null;
    private viewMode:string = 'map';

    private stores: any[] = [];
    private states: any[] = [];
    private allStores: any[] = [];
    private listStores:any[] =[];
    private refreshTimer:any=null;

    private homeData: any = {state:''};

    private hasGotEvent: boolean = false;

    private directionsService:any=null;
    private directionsDisplay:any=null;

    private showPinInfo:boolean = false;
    private showListInfo:boolean = false;
    private selectedPin: any = null;

    constructor(public navCtrl: NavController,public events: Events,public loadingCtrl: LoadingController,public uiHelper: UiHelper,public server: AppServer,public globals: AppGlobals) {
        this.currentTs=(new Date().getTime()).toString();
        let that=this;
        this.events.subscribe('location_changed',()=>{
            if (that.hasGotEvent){
                return;
            }
            that.hasGotEvent=true;
            that.sortArrayOfStores(that.globals.currentLocation.latitude,that.globals.currentLocation.longitude);
            that.showListInfo=true;
            if (that.map!=null){
                that.map.setCenter({lat:that.globals.currentLocation.latitude, lng:that.globals.currentLocation.longitude});
            }
        });
        this.events.subscribe('store_claimed',()=>{
            for (let a=0;a<that.allStores.length;a++){
                if (that.allStores[a].marker!=null){
                    that.allStores[a].marker.setMap(null);
                    that.allStores[a].marker=null;
                }
            }
            that.allStores.splice(0,that.allStores.length);
            that.allStores=[];
            for (let a=0;a<that.stores.length;a++){
                if (that.stores[a].marker!=null){
                    that.stores[a].marker.setMap(null);
                    that.stores[a].marker=null;
                }
            }
            that.stores.splice(0,that.stores.length);
            that.getStores();
        });
    }

    ionViewDidLoad(){
        this.initMyMap();
        this.getStores();
        let that=this;
        /*this.refreshTimer=setInterval(function(){
            that.getStores();
        },15000);*/
    }

    ionViewWillUnload(){
        if(this.refreshTimer!=null){
            clearInterval(this.refreshTimer);
        }
    }

    viewModeChanged(evt: Event){
        console.log("viewModeChanged: "+this.viewMode);
        if (this.viewMode=='map'){
            //this.initMyMap();
        }
    }

    initMyMap(){
        let that=this;
        let currPos={lat: 39.14471305847222,lng: -102.89278305625459};
        if (that.globals.currentLocation!=null){
            that.hasGotEvent=true;
            currPos.lat=that.globals.currentLocation.latitude;
            currPos.lng=that.globals.currentLocation.longitude;
        }
        
        that.map=(<any>window).initMapUi("map_"+that.currentTs,currPos);
        if (that.globals.currentLocation!=null){
            //that.marker=(<any>window).addMarkerToMap(that.map,currPos,true);
            that.map.setZoom(7);
        }else{
            that.map.setZoom(7);
        }
        that.map.addListener('click', function(e) {
            let latLng=e.latLng;
            console.log("LatLng: "+JSON.stringify(latLng));
            let latitude=latLng.lat();
            let longitude=latLng.lng();
            console.log(latitude+","+longitude);
            that.showPinInfo=false;
            that.selectedPin=null;
            that.showListInfo=false;
        });

        let searchBox=(<any>window).initSearchBox(that.map,"mapSearch_"+that.currentTs,true);
        searchBox.addListener('places_changed', function() {
            let places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }
            let bounds = new (<any>window).google.maps.LatLngBounds();
            let hasGeometry=false;
            let place=places[0];
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
            }else{
                //alert(JSON.stringify(place.geometry));
            }
            hasGeometry=true;
            if (hasGeometry){
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
                that.map.fitBounds(bounds);
            }

            if (place.geometry){
                let latitude=place.geometry.location.lat();
                let longitude=place.geometry.location.lng();
                console.log("det: "+latitude+","+longitude);
                if (that.marker!=null){
                    (<any>window).clearMarker(that.marker);
                }
                let latLng=new (<any>window).google.maps.LatLng(latitude,longitude);
                that.showListInfo=false;
                that.showPinInfo=false;
                that.selectedPin=null;
                that.sortArrayOfStores(latitude,longitude);
                that.showListInfo=true;
            }
        });

        that.directionsDisplay=new (<any>window).google.maps.DirectionsRenderer();
        that.directionsService=new (<any>window).google.maps.DirectionsService();
        that.directionsDisplay.setMap(that.map);
    }

    filterStores(){
        this.stores=[];
        for (let a=0;a<this.allStores.length;a++){
            if(this.allStores[a].state.toLowerCase()==this.homeData.state.toLowerCase()){
                try{
                    let st=JSON.parse(JSON.stringify(this.allStores[a]));    
                    st.distance_text="";
                    if (this.globals.currentLocation!=null){
                        st.distance_text=this.uiHelper.roundToDecimal(this.calcDistance(this.globals.currentLocation.latitude,this.globals.currentLocation.longitude,st.store_latitude,st.store_longitude).toString(),2)+"m";
                    }
                    this.stores.push(st);
                }catch(e){
                    console.error(a.toString()+": "+e.message);
                }
            }
        }
    }

    private defaultDirectionsMode: string = 'WALKING';
    private directionsMode: string = '';
    private showDirectionsSelector: boolean = false;
    private directionsStore: any = null;
    private loadingDirections: boolean = false;

    directionsModeChanged(evt: Event){
        if (this.directionsMode=="CLOSE"){
            this.showDirectionsSelector=false;
            this.directionsStore=null;
            this.loadingDirections=false;
            this.streetViewImageUrl="";
        }else if (this.directionsMode=="STREETVIEW"){
            this.openStreetView(this.directionsStore);
        }else{
            this.streetViewImageUrl="";
            this.doShowStoreDirections();
        }
    }

    doShowStoreDirections(){
        let st=this.directionsStore;
        this.showListInfo=false;
        this.directionsDisplay.setMap(null);
        let currLoc=new (<any>window).google.maps.LatLng(this.globals.currentLocation.latitude,this.globals.currentLocation.longitude);
        let stLoc = new (<any>window).google.maps.LatLng(st.store_latitude,st.store_longitude);
        //currLoc = {lat: 33.960673, lng: -116.5010527};  // Haight.
        //stLoc = {lat: 38.3323071, lng: -122.7139566}; // Ocean Beach.
        let request = {
            origin: currLoc,
            destination: stLoc,
            travelMode: this.directionsMode
            //travelMode: 'TRANSIT'
        };
        let that=this;
        this.directionsService.route(request, function(result, status) {
            this.loadingDirections=false;
            if (status == 'OK') {
                that.directionsDisplay.setMap(that.map);
                that.directionsDisplay.setDirections(result);
            }else{
                if (status=='ZERO_RESULTS'){
                    that.uiHelper.showMessageBox("","No direction found from google");
                }
            }
        });
    }


    showStoreDirection(st) {
        this.viewMode='map';
        this.directionsStore=st;
        this.showDirectionsSelector=true;
        this.directionsMode=this.defaultDirectionsMode;
        this.doShowStoreDirections();
    }

    storesSuccess(res: Response){
        console.log("storesSuccess");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        //console.log(res.text());
        let jsonRes=res.json();
        if (jsonRes.status!=200){
            this.uiHelper.showMessageBox('Error',jsonRes.msg);
        }else{
            let stores=jsonRes.stores;
            this.stores=[];
            for (let a=0;a<stores.length;a++){
                let st=stores[a];
                st.imagesJson=[];
                if (st.image_url!=null && st.image_url!=''){
                    st.imagesJson=JSON.parse(st.image_url);
                }
                if (st.imagesJson.length>0){
                    st.image_url=st.imagesJson[0];
                    if (st.imagesJson.length>1){
                        st.imagesJson.splice(0,1);
                        st.image_url=st.imagesJson[0];
                    }
                }
                //console.log(st.image_url);
                st.has_delivery_timings=false;
                st.has_store_timings=false;
                if (st.is_claimed=="1" && st.delivery=="1" && st.delivery_timings!=null && st.delivery_timings!=''){
                    let dlv=JSON.parse(st.delivery_timings);
                    st.has_delivery_timings=true;
                }
                if (st.is_claimed=="1" && st.store_timings!=null && st.store_timings!=''){
                    let dlv=JSON.parse(st.store_timings);
                    st.has_store_timings=true;
                }
                if (st.web_url!=null && st.web_url!=''){
                    if(st.web_url.indexOf("http")!=0){
                        st.web_url="http://"+st.web_url;
                    }
                }
                //this.stores.push(st);

                if (st.store_latitude!=null && st.store_latitude!="" && st.store_longitude!=null && st.store_longitude!=""){
                    let latLng=new (<any>window).google.maps.LatLng(st.store_latitude,st.store_longitude);
                    let pcam=false;
                    if (a==0 && this.globals.currentLocation==null){
                        pcam=true;
                    }
                    let mrk=(<any>window).addMarkerToMap(this.map,latLng,pcam);
                    mrk.title=st.id;
                    let that=this;
                    mrk.addListener('click', function() {
                        let pid=parseInt(this.title);
                        for (let b=0;b<that.allStores.length;b++){
                            if (that.allStores[b].id==pid){
                                //that.storeInfoClick(that.allStores[b]);
                                that.storeMarkerClick(that.allStores[b]);
                                break;
                            }
                        }
                    });
                    st.marker=mrk;
                }else{
                    st.marker=null;
                }

                this.allStores.push(st);
            }

            let states=jsonRes.states;
            this.states=[];
            for (let a=0;a<states.length;a++){
                let st=states[a];
                this.states.push(st);
                if (a==0){
                    this.homeData.state=st.state_name;
                }
            }

            if (this.globals.currentLocation!=null){
                let origLat = this.globals.currentLocation.latitude;
                let origLong = this.globals.currentLocation.longitude;
                this.sortArrayOfStores(origLat,origLong);
            }
            this.filterStores();
            if (this.globals.currentLocation!=null){
                this.showListInfo=true;
            }
        }
    }

    storesFailure(error: any){
        console.log("storesFailure");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        this.uiHelper.showMessageBox('Error',JSON.stringify(error));
    }

    stateChanged(){
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        let that=this;
        setTimeout(function(){
            that.filterStores();
        },500);
        setTimeout(function(){
            if (that.loader!=null){
                that.loader.dismiss();
            }
        },3000);
        
    }

    getStores(){
        console.log("getStores");
        let that=this;
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        let uid="1";
        if (this.globals.currentUser!=null){
            uid=this.globals.currentUser.id;
        }
        that.server.getHomeFeed({user_id: uid}).subscribe(
            res=>that.storesSuccess(res),err=>that.storesFailure(err)
        );
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
    }

    websiteClick(st){
        console.log("websiteClick: "+st.store_name);
        window.open(st.web_url,'_blank');
    }

    rightIconClick(){
        this.navCtrl.push(ProfilePage);
    }

    storeImageClick(st){
        this.navCtrl.push(StoreDetailPage,{store: st});
    }

    storeInfoClick(st){
        this.navCtrl.push(StoreDetailPage,{store: st});
    }

    storeMarkerClick(st){
        this.showListInfo=false;
        this.selectedPin=st;
        this.showPinInfo=true;
        //this.showStoreDirection(st);
    }

    showCurrentDirections(){
        if (this.selectedPin==null){
            return;
        }
        this.showStoreDirection(this.selectedPin);
    }

    truckClick(st){

    }

    clockClick(st){
        
    }

    logoutClick(){
        let that=this;
        this.uiHelper.showConfirmBox2("Logout","Are you sure you want to logout?","Yes",()=>{
            that.globals.setUser(null);
            that.globals.currentUser=null;
            (<any>window).location.reload();
        },"No",()=>{});
    }

    calcDistance(lat1, lon1, lat2, lon2) {
        let radlat1 = Math.PI * lat1 / 180;
        let radlat2 = Math.PI * lat2 / 180;
        let theta = lon1 - lon2;
        let radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        //1.6=1
        dist = (1/1.6)*dist; //miles conversion
        return dist;
    }

    sortArrayOfStores(origLat,origLong){
        let that=this;
        this.allStores.sort(function(a, b) {
            return that.calcDistance(origLat, origLong, a.store_latitude, a.store_longitude) - that.calcDistance(origLat, origLong, b.store_latitude, b.store_longitude);
        });
        this.listStores=[];
        for (let x=0;x<this.allStores.length;x++){
            if (x<100){
                let xt=this.allStores[x];
                xt.distance_text=this.uiHelper.roundToDecimal(this.calcDistance(origLat,origLong,xt.store_latitude,xt.store_longitude).toString(),2)+"m";
                this.listStores.push(xt);
            }
        }
    } 

    private streetViewImageUrl:string = '';

    openStreetView(st){
        console.log("openStreetView");
        let addr = {latitude: st.store_latitude,longitude: st.store_longitude};
        let url="https://maps.googleapis.com/maps/api/streetview?size=600x300&location="+addr.latitude+","+addr.longitude+"&heading=151.78&pitch=0&key="+this.globals.mapsApiKey;
        this.streetViewImageUrl=url;
    }
}
