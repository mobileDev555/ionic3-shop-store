import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { HomePage } from '../home/home';
import { AppServer } from '../../services/appserver';
import { AppGlobals } from '../../services/appglobals';
import { UiHelper } from '../../services/uihelper';
import { Response } from '@angular/http';
import { AlertController,ToastController,LoadingController,ModalController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular'
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UpgradePackagePage } from '../upgrade-package/upgrade-package';

@Component({
  selector: 'page-claim-store',
  templateUrl: 'claim-store.html'
})

export class ClaimStorePage {

    private lastErrorMessage: string = "";
    private loader: any = null;
    private recipe: any = null;
    private attachedImages: any[];
    private currentUploadIndex: number = 0;
    private fileTransfer: FileTransferObject = null;

    private videoUrl: string = '';
    private sanitizedVideoUrl: SafeUrl = "";

    private maxNumberOfImages: number = 1;
    private canAddVideo: boolean = true;

    private store_timings:any[]=[];
    private delivery_timings:any[]=[];

    private hours_to_display:any[]=[];
    
    constructor(private sanitizer: DomSanitizer, private camera: Camera, private transfer: FileTransfer, private file: File, private filePath: FilePath, private actionSheetCtrl: ActionSheetController, private modalCtrl: ModalController,public uiHelper:UiHelper, public events: Events, public navCtrl: NavController, public navParams: NavParams,public loadingCtrl: LoadingController, public alertCtrl: AlertController,public toastCtrl: ToastController, public server: AppServer, public globals: AppGlobals) {
        if (this.navParams.get('store')){
            this.recipe=JSON.parse(JSON.stringify(this.navParams.get('store')));
            this.recipe.web_url='';
            this.recipe.store_description='';
            this.recipe.delivery=false;
        }else{
            this.navCtrl.pop();
        }
        this.attachedImages=[];
        //this.attachedImages.push("https://www.gstatic.com/webp/gallery/3.jpg");
        //this.attachedImages.push("https://www.gstatic.com/webp/gallery/1.jpg");
        this.fileTransfer=this.transfer.create();

        for (let a=0;a<24;a++){
            let hour=a;
            let amPm="AM";
            if (hour==0){
                hour=12;
            }else if (hour>12){
                hour-=12;
                amPm="PM";
            }else if (hour==12){
                amPm="PM";
            }
            let tle=hour.toString();
            if (hour<10){
                tle="0"+tle;
            }
            tle+=":00";
            tle+=" "+amPm;
            this.hours_to_display.push({title: tle});
        }

        //alert(JSON.stringify(this.hours_to_display));

        this.store_timings.push({start_hour:'12:00 AM',end_hour:'11:00 PM'});
        this.delivery_timings.push({start_hour:'12:00 AM',end_hour:'11:00 PM'});
    }

    ionViewDidLoad(){
    }

    ionViewDidEnter(){
        this.canAddVideo=false;
        if (this.globals.currentUser.user_package==this.globals.packageLight){
            this.maxNumberOfImages=5;
        }else if (this.globals.currentUser.user_package==this.globals.packageMedium){
            this.maxNumberOfImages=10;
        }else if (this.globals.currentUser.user_package==this.globals.packagePremium){
            this.maxNumberOfImages=15;
            this.canAddVideo=true;
        }else{
            this.maxNumberOfImages=1;
        }
    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    addPostSuccess(res: Response){
        console.log("addPostSuccess");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        let jsonRes=res.json();
        if (jsonRes.status!=200){
            this.uiHelper.showMessageBox('Error',jsonRes.msg);
        }else{
            this.uiHelper.showMessageBox("Success","Your claim request is successful");
            this.navCtrl.pop();
            this.events.publish('store_claimed');
        }
    }

    addPostFailure(error: any){
        console.log("addPostFailure");
        if (this.loader!=null){
            this.loader.dismiss();
        }
        this.uiHelper.showMessageBox('Error',JSON.stringify(error));
    }

    doSavePost(){
        let that=this;
        this.setRecipeFromAttachedImages();
        let claimData={user_id: this.globals.currentUser.id,store_id: this.recipe.id,web_url: this.recipe.web_url,description: this.recipe.store_description,image_url:this.recipe.image_url,delivery: this.recipe.delivery,delivery_timings: JSON.stringify(this.delivery_timings),store_timings: JSON.stringify(this.store_timings)};
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        that.server.claimStore(claimData).subscribe(
            res=>that.addPostSuccess(res),err=>that.addPostFailure(err)
        );
    }

    removeExistingImage(idx){
        this.recipe.imagesJson.splice(idx,1);
    }

    removeAttachedImage(idx){
        this.attachedImages.splice(idx,1);
    }

    removeAttachedVideo(){
        if (this.videoUrl!=''){
            for (let a=0;a<this.attachedImages.length;a++){
                if (this.attachedImages[a]==this.videoUrl){
                    this.attachedImages.splice(a,1);
                }
            }
        }
        this.videoUrl='';
    }

    setRecipeFromAttachedImages(){
        let xt=this.recipe.imagesJson.concat(this.attachedImages);
        this.recipe.image_url=JSON.stringify(xt);
    }

    saveClick(){
        /*if (this.recipe.web_url==''){
            this.uiHelper.showMessageBox("Error","Please enter website url");
            return;
        }*/
        if (this.attachedImages.length<=0){
            //this.attachedImages.push("https://www.gstatic.com/webp/gallery/3.jpg");
            //this.attachedImages.push("https://www.gstatic.com/webp/gallery/1.jpg");
            this.doSavePost();
            //this.uiHelper.showMessageBox("Photo","Please select/attach a photo");
            return;
        }else{
            try{
                this.currentUploadIndex=0;
                this.uploadAttachedImage();
            }catch(e){
                this.uiHelper.showMessageBox('Error',e.message);
            }
        }
    }

    upgradePackageClick(){
        console.log("upgradePackageClick");
        this.navCtrl.push(UpgradePackagePage);
    }

    private lastImageType: string = 'image';

    recordVideo(){
        let that=this;
        this.lastImageType='video';
        var captureSuccess = function(mediaFiles) {
            try{
                for (let i=0;i<mediaFiles.length;i++) {
                    let path = mediaFiles[i].fullPath;
                    if (that.attachedImages.length>0){
                        that.attachedImages.splice(0,that.attachedImages.length);
                    }
                    that.setPhotoFilePath(path);
                    //alert(that.imageType+","+that.imageUrl);
                    break;
                }
            }catch(e){
                alert("Exception success: "+e.message);
            }
        };

        // capture error callback
        var captureError = function(error) {
            if (error.code==3){
                return;
            }
            alert('Video Capture Error, code: ' + error.code);
        };

        try{
            // start video capture
            (<any>navigator).device.capture.captureVideo(captureSuccess, captureError, {limit:1,duration: 10});
        }catch(e){
            alert("Exception: "+e.message);
        }
    }

    attachImageFromCamera(){
        if (this.attachedImages.length==this.maxNumberOfImages){
            this.uiHelper.showMessageBox("","You cannot attach more images");
            return;
        }
        this.lastImageType='image';
        this.attachImage(2);
    }

    attachImageFromGallery(){
        if (this.attachedImages.length==this.maxNumberOfImages){
            this.uiHelper.showMessageBox("","You cannot attach more images");
            return;
        }
        this.lastImageType='image';
        this.attachImage(3);
    }

    //picture attach

    setPhotoFilePath(filePath){
        if (this.lastImageType=='image'){
            this.attachedImages.push(filePath);
        }
        if (this.lastImageType=='video'){
            this.videoUrl=filePath;
            this.sanitizedVideoUrl=this.sanitize(this.videoUrl);
        }

        //show loader
        let that=this;
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        setTimeout(function(){
            that.loader.dismiss();
            //that.uiHelper.showMessageBox("File",that.recipe.image_url);
        },300);
    }

    onPhotoURISuccess(imageURI) {
        console.log("onPhotoURISuccess: "+imageURI);
        try{
            let resolvePath=true;
            if (imageURI.indexOf("/")==0){
                imageURI="file://"+imageURI;
                resolvePath=false;
            }
            if (this.attachedImages.length>0){
                //this.attachedImages.splice(0,this.attachedImages.length);
            }
            let that=this;
            this.filePath.resolveNativePath(imageURI)
                .then(filePath => that.setPhotoFilePath(filePath))
                //.catch(err => alert("Error: "+JSON.stringify(err)));
                .catch((err) => {
                    if (err.code==1){
                        //cloud file
                        that.setPhotoFilePath(imageURI);
                    }else{
                        that.uiHelper.showMessageBox("Error",JSON.stringify(err));
                    }
                }
            );
        }catch(e){
            this.uiHelper.showMessageBox("Exception",e.message);
        }
    }

    onPhotoURIFail(message) {
        this.uiHelper.showMessageBox("onPhotoURIFail",message);
    }
    
    attachImage(val){
        var that=this;
        if (val===2 || val===3){
	        let camOptions={
                quality: 80,
                sourceType:0,
                destinationType: this.camera.DestinationType.FILE_URI,
                encodingType: this.camera.EncodingType.JPEG,
                saveToPhotoAlbum: false,
                correctOrientation: true,
                targetWidth: 480,
                targetHeight: 480
            };

            try{
                if (val===2){
                    //camera capture
                    camOptions.sourceType=this.camera.PictureSourceType.CAMERA;
                }else if (val===3){
                    //photo library
                    camOptions.sourceType=this.camera.PictureSourceType.PHOTOLIBRARY;
                    camOptions.correctOrientation=false;
                }
                this.camera.getPicture(camOptions).then((imageData) => {
                        that.onPhotoURISuccess(imageData);
                    }, (err) => {
                        that.onPhotoURIFail(err);
                    }
                );
            }catch(e){
                this.uiHelper.showMessageBox("Exception",e.message);
            }
        }
    }

    //picture attach end

    //picture upload

    uploadSuccess(resp){
        if (this.loader!=null){
            this.loader.dismiss();
        }
        let response=JSON.parse(resp.response);
        this.attachedImages[this.currentUploadIndex]=response.url;
        this.currentUploadIndex++;
        if (this.currentUploadIndex<this.attachedImages.length){
            this.uploadAttachedImage();
        }else{
            this.doSavePost();
        }
    }

    uploadError(error){
        if (this.loader!=null){
            this.loader.dismiss();
        }
        this.uiHelper.showMessageBox("Upload Error","An error has occurred in image: Code = " + error.code);
    }

    uploadAttachedImage(){

        console.log("uploadAttachedImage");

        let that=this;

        let currFileName=that.attachedImages[that.currentUploadIndex];

        let options = {fileKey:'',fileName:'',mimeType:'',chunkedMode:false,headers:{},params:{},httpMethod:'POST'};
        options.fileKey = "media_file";
        let isVideo=false;
        if(currFileName.toLowerCase().endsWith('.png')){
            options.fileName="test.png";
            options.mimeType = "image/png";
        }else if(currFileName.toLowerCase().endsWith('.mp4')){
            isVideo=true;
            options.fileName="test.mp4";
            options.mimeType = "video/mp4";
        }else{
            options.fileName = "test.jpg";
            options.mimeType = "image/jpeg";
        }
        options.chunkedMode = false;
        if(isVideo){
            options.chunkedMode=false;
        }
        options.headers = {
            Connection: "close"
        };

        var params = {};
        options.params = params;

        this.loader = this.loadingCtrl.create({
            content: "Uploading picture...",
        });
        this.loader.present();

        //alert(that.server.getImageSaveUrl());

        that.fileTransfer.upload(that.attachedImages[that.currentUploadIndex], that.server.getImageSaveUrl(),options)
            .then((data) => {
                that.uploadSuccess(data);
            }, (err) => {
                that.uploadError(err);
            }).catch(e => {
                that.uiHelper.showMessageBox("Exception",e.message);
            })
    }

    //picture upload end

    backClick(){
        console.log("backClick");
        this.navCtrl.pop();
    }
}
