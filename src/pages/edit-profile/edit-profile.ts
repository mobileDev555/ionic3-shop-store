import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Response } from '@angular/http';
import { AppGlobals } from '../../services/appglobals';
import { AppServer } from '../../services/appserver';
import { UiHelper } from '../../services/uihelper';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html'
})
export class EditProfilePage {

    private user:any={};
    private loader:any=null;

    private fileTransfer: FileTransferObject = null;
    private attachedImages:any[]=[];
    private currentUploadIndex: number = 0;
    private profileImageUrl:string='';

    constructor(private camera: Camera, private transfer: FileTransfer, private file: File, private filePath: FilePath, private sanitizer:DomSanitizer,public navCtrl: NavController,public globals: AppGlobals,public modalCtrl: ModalController,public loadingCtrl: LoadingController,public server: AppServer,public uiHelper: UiHelper,public actionSheetCtrl: ActionSheetController) {
        this.user=this.globals.getUser();
        this.user.old_password='';
        this.user.new_password='';
        this.user.c_new_password='';
        this.user.image_url=this.user.profile_pic_url;
        this.profileImageUrl=this.user.image_url;

        this.attachedImages=[];
        this.fileTransfer=this.transfer.create();
    }

    sanitize(url:string){
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    ionViewDidLoad(){
        console.log("EditProfilePage -> ionViewDidLoad");
        let that=this;
    }

    updateClick(){
        if(this.user.new_password!=''){
            /*if(this.user.old_password!=this.user.password){
                this.uiHelper.showMessageBox("","Invalid old password");
                return;
            }else*/ 
            if (this.user.new_password!=this.user.c_new_password){
                this.uiHelper.showMessageBox("","Passwords do not match");
                return;
            }
        }
        if(this.attachedImages.length>0){
            this.currentUploadIndex=0;
            this.uploadAttachedImage();
        }else{
            this.doUpdateProfile();
        }
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
            this.globals.setUser(registerData);
            this.globals.currentUser=registerData;
            this.uiHelper.showMessageBox("","Profile updated!");
            this.navCtrl.pop();
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
        that.server.updateProfile(this.user).subscribe(
            res=>that.profileSuccess(res),err=>that.profileFailure(err)
        );
    }

    profilePicClick(){
        let that=this;
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Select image from',
            buttons: [
                {
                    text: 'Camera',
                    handler: () => {
                        console.log('Camera clicked');
                        that.attachImage(2);
                    }
                },
                {
                    text: 'Gallery',
                    handler: () => {
                        console.log('Gallery clicked');
                        that.attachImage(3);
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ]
        });

        actionSheet.present();
    }

    //picture attach

    setPhotoFilePath(filePath){
        this.attachedImages.push(filePath);
        this.profileImageUrl=filePath;
    }

    onPhotoURISuccess(imageURI) {
        console.log("onPhotoURISuccess: "+imageURI);
        try{
            if (this.attachedImages.length>0){
                this.attachedImages.splice(0,this.attachedImages.length);
            }
            let that=this;
            this.filePath.resolveNativePath(imageURI)
                .then(filePath => that.setPhotoFilePath(filePath))
                .catch(err => alert("Error: "+JSON.stringify(err)));
        }catch(e){
            this.uiHelper.showMessageBox("Exception",e.message);
        }
    }

    onPhotoURIFail(message) {
        this.uiHelper.showMessageBox("onPhotoURIFail",message);
    }
    
    attachImage(val){
        let that=this;
        if (val===2 || val===3){
	        let camOptions={
                quality: 80,
                sourceType:0,
                destinationType: this.camera.DestinationType.FILE_URI,
                encodingType: this.camera.EncodingType.JPEG,
                saveToPhotoAlbum: false,
                correctOrientation: true,
                targetWidth: 320,
                targetHeight: 320
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
        this.currentUploadIndex++;
        let response=JSON.parse(resp.response);
        this.profileImageUrl=response.url;
        this.user.image_url=this.profileImageUrl;
        this.doUpdateProfile();
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
        if(currFileName.toLowerCase().endsWith('.png')){
            options.fileName="test.png";
            options.mimeType = "image/png";
        }else{
            options.fileName = "test.jpg";
            options.mimeType = "image/jpeg";
        }
        options.chunkedMode = false;
        options.headers = {
            Connection: "close"
        };

        let params = {};
        options.params = params;

        this.loader = this.loadingCtrl.create({
            content: "Uploading profile picture...",
        });
        this.loader.present();

        try{
        that.fileTransfer.upload(that.attachedImages[that.currentUploadIndex], that.server.getImageSaveUrl(),options)
            .then((data) => {
                that.uploadSuccess(data);
            }, (err) => {
                that.uploadError(err);
            }).catch(e => {
                that.loader.dismiss();
                that.uiHelper.showMessageBox("Exception",e.message);
            })
        }catch(e){
            that.loader.dismiss();
            that.uiHelper.showMessageBox("Exception2",e.message);
        }
    }

    //picture upload end
}
