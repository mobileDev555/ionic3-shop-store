import {Injectable} from "@angular/core";
import { AlertController,ToastController,LoadingController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable() export class UiHelper {

    private months:any[]=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    constructor(public sanitizer: DomSanitizer,public loadingCtrl: LoadingController, public alertCtrl: AlertController,public toastCtrl: ToastController){

    }

    public sanitizeHTML(html: string){
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    public getNewLinesHtml(bio_text:string,perform_hash_tag:boolean=true){
        bio_text=bio_text.replace(/\r/g,"");
        bio_text=bio_text.replace(/\n/g,"<br />");

        if (perform_hash_tag){
            //bio_text=bio_text.replace(/(^|\s)#(\w+)/g, "$1<a href='#' onclick=\"callHashtag('#$2')\">#$2</a>");
            bio_text=bio_text.replace(/(^|.|\s)#(\w+)/g, "$1<a href='#' onclick=\"callHashtag(event,'#$2')\">#$2</a>");
        }

        return bio_text;
    }

    public roundToDecimal(val:string,decs:number){
        let commVals=val.split(".");
        let commStr=commVals[0];
        let decStr="";
        let decCount=0;
        if (commVals.length>1){
            if (commVals[1].length>decs){
                decStr=commVals[1].substring(0,decs);
            }else if (commVals[1].length<decs){
                decStr=commVals[1];
                decCount=decs-commVals[1].length;
            }else{
                decStr=commVals[1];
            }
        }else{
            decCount=decs;
        }
        if (decCount>0){
            for (var a=1;a<=decCount;a++){
                decStr+="0";
            }
        }
        if (decStr!=""){
            commStr+="."+decStr;
        }
        return commStr;
    }

    public getRecipeHighResFromUrl(imageUrl){
        console.log("getRecipeHighResFromUrl");
        let vals=imageUrl.split("=");
        let image=vals[0];
        if (vals.length>1){
            image+="=s320";
        }
        console.log("new Image: "+image);
        return image;
    }

    public showMessageBox(titleText,messageText){
        let alert = this.alertCtrl.create({
            title: titleText,
            message: messageText,
            buttons: ['OK']
        });
        alert.present();
    }

    public showIUnderstandMessageBox(titleText,messageText,yesHandler){
        let alert = this.alertCtrl.create({
            title: titleText,
            message: messageText,
            subTitle: 'Rules',
            buttons: [
                {
                    text:'I understand the rules',
                    handler: yesHandler
                }
            ],
            //enableBackdropDismiss: false,
        });
        alert.present();
    }

    public showConfirmBox(titleText,messageText,yesHandler,noHandler){
        let alert = this.alertCtrl.create({
            title: titleText,
            message: messageText,
            buttons: [
                {
                    text: 'Yes',
                    handler: yesHandler
                },
                {
                    text: 'No',
                    handler: noHandler
                }
            ]
        });
        alert.present();
    }

    public showConfirmBox2(titleText,messageText,yesText,yesHandler,noText,noHandler){
        let alert = this.alertCtrl.create({
            title: titleText,
            message: messageText,
            buttons: [
                {
                    text: yesText,
                    handler: yesHandler
                },
                {
                    text: noText,
                    handler: noHandler
                }
            ]
        });
        alert.present();
    }

    public getDateInIonic(dt){
        let year=dt.getFullYear();
        let month=dt.getMonth()+1;
        let str=year+"-";
        if (month<10){
            str+="0";
        }
        str+=month+"-";
        let date=dt.getDate();
        if (date<10){
            str+="0";
        }
        str+=date+"T";
        let hour=dt.getHours();
        let mins=dt.getMinutes();
        if (hour<10){
            str+="0";
        }
        str+=hour+":";
        if (mins<10){
            str+="0";
        }
        str+=mins+"Z";
        console.log("currentDateIonic: "+str);
        return str;
    }

    public getCurrentDateInIonic(){
        let dt=new Date();
        let year=dt.getFullYear();
        let month=dt.getMonth()+1;
        let str=year+"-";
        if (month<10){
            str+="0";
        }
        str+=month+"-";
        let date=dt.getDate();
        if (date<10){
            str+="0";
        }
        str+=date+"T";
        let hour=dt.getHours();
        let mins=dt.getMinutes();
        if (hour<10){
            str+="0";
        }
        str+=hour+":";
        if (mins<10){
            str+="0";
        }
        str+=mins+"Z";
        console.log("currentDateIonic: "+str);
        return str;
    }

    public getMealDisplayDate(mealDt){
        console.log("getMealDisplayDate: "+mealDt);
        let vals=mealDt.split(" ");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let currentDate=new Date();
        let tOffset=currentDate.getTimezoneOffset();
        console.log(tOffset);
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        let mealTime=mealDate.getTime();
        //mealTime+=(1000*60*60*5);
        tOffset*=-1;
        mealTime+=(tOffset*60*1000);
        mealDate.setTime(mealTime);
        let currentTime=currentDate.getTime();
        let remainingMs=mealTime-currentTime;
        let dateStr="";
        let minuteStr="";
        let hourStr="";
        let hours=mealDate.getHours();
        let minutes=mealDate.getMinutes();
        let amPmStr="am";
        if (hours>12){
            hours=hours-12;
            amPmStr="pm";
        }else if (hours==0){
            hours=12;
            amPmStr="am";
        }
        if (minutes<10){
            minuteStr="0"+minutes;
        }else{
            minuteStr=""+minutes;
        }
        if (hours<10){
            hourStr="0"+hours;
        }else{
            hourStr=""+hours;
        }
        let hoursStr=hourStr+":"+minuteStr+" "+amPmStr;
        if (mealDate.getFullYear()==currentDate.getFullYear()
            && mealDate.getMonth()==currentDate.getMonth()
            && mealDate.getDate()==currentDate.getDate()){

            //it is today .. now check for day or night
            if (mealDate.getHours()<5 || mealDate.getHours()>=19){
                dateStr=hoursStr+" - Tonight";
            }else{
                dateStr=hoursStr+" - Today";
            }
        }else if (mealDate.getFullYear()==currentDate.getFullYear()
            && mealDate.getMonth()==currentDate.getMonth()
            && mealDate.getDate()==(currentDate.getDate()+1)){

            //it is tomorrow .. now check for day or night
            if (mealDate.getHours()<5 || mealDate.getHours()>=19){
                dateStr=hoursStr+" Tomorrow";
            }else{
                dateStr=hoursStr+ "Tomorrow";
            }
        }else{
            let dtStr:any=mealDate.getDate();
            if (dtStr<10){
                dtStr="0"+dtStr;
            }
            dateStr=hoursStr+" - "+dtStr+" "+this.months[mealDate.getMonth()];
        }
        console.log("dateStr: "+dateStr);
        return dateStr;
    }

    public getReviewDisplayDate(mealDt){
        console.log("getReviewDisplayDate: "+mealDt);
        let vals=mealDt.split(" ");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let currentDate=new Date();
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        let dateStr="";
        
        let dtStr:any=mealDate.getDate();
        if (dtStr<10){
            dtStr="0"+dtStr;
        }
        dateStr=dtStr+" "+this.months[mealDate.getMonth()]+", "+mealDate.getFullYear();
        console.log("dateStr: "+dateStr);
        return dateStr;
    }

    public getRemainingPercentage(mealDt,addDt){
        let vals=mealDt.split(" ");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let currentDate=new Date();
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        vals=addDt.split(" ");
        dVals=vals[0].split("-");
        tVals=vals[1].split(":");
        let addDate=new Date();
        addDate.setFullYear(parseInt(dVals[0]));
        addDate.setMonth(parseInt(dVals[1])-1);
        addDate.setDate(parseInt(dVals[2]));
        addDate.setHours(parseInt(tVals[0]));
        addDate.setMinutes(parseInt(tVals[1]));
        addDate.setSeconds(0);

        let mealTime=mealDate.getTime();
        let addTime=addDate.getTime();
        let currentTime=currentDate.getTime();
        let remainingMs=mealTime-currentTime;
        let hundredPerc=mealTime-addTime;
        let remainingPerc=50;//(100/hundredPerc)*remainingMs;
        return remainingPerc;
    }

    public getMinutesRemainingStr(mealDt){
        let vals=mealDt.split(" ");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let currentDate=new Date();
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        let mealTime=mealDate.getTime();
        let currentTime=currentDate.getTime();
        let remainingMs=mealTime-currentTime;
        let dtStr="";
        let mins=Math.round((remainingMs/1000/60));
        let hours=Math.round(mins/60);
        let days=Math.round(hours/24);

        let retVal={type:'',text:'',value:0};

        if (mins<60){
            dtStr=mins+"<br />mins";
            retVal.type="mins";
            retVal.text=dtStr;
            retVal.value=mins;
        }else if (hours<=48){
            dtStr=hours+"<br />hrs";
            retVal.type="hours";
            retVal.text=dtStr;
            retVal.value=hours;
        }else{
            dtStr=days+"<br />days";
            retVal.type="days";
            retVal.text=dtStr;
            retVal.value=days;
        }

        return retVal;
    }

    public getMinutesAgoStr(mealDt){
        let vals=mealDt.split(" ");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let currentDate=new Date();
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        let mealTime=mealDate.getTime();
        let currentTime=currentDate.getTime();
        let remainingMs=currentTime-mealTime;
        let dtStr="";
        let mins=Math.round((remainingMs/1000/60));
        let hours=Math.round(mins/60);
        let days=Math.round(hours/24);

        let retVal={type:'',text:'',value:0};

        if (mins<60){
            dtStr=mins+" mins ago";
            retVal.type="mins";
            retVal.text=dtStr;
            retVal.value=mins;
        }else if (hours<=48){
            dtStr=hours+" hrs ago";
            retVal.type="hours";
            retVal.text=dtStr;
            retVal.value=hours;
        }else{
            dtStr=days+" days ago";
            retVal.type="days";
            retVal.text=dtStr;
            retVal.value=days;
        }

        return retVal;
    }

    public getTimestampFromIonicDate(mealDt){
        let vals=mealDt.split("T");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        let mealTime=mealDate.getTime();
        return mealTime;
    }

    public getDbTimeFromIonicDate(mealDt){
        let vals=mealDt.split("T");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        let mealTime=mealDate.getFullYear()+"-"+(mealDate.getMonth()+1)+"-"+mealDate.getDate();
        mealTime+=" "+mealDate.getHours()+":"+mealDate.getMinutes()+":"+mealDate.getSeconds();
        return mealTime;
    }

    public getMealDisplayDateFromIonic(mealDt){
        let vals=mealDt.split("T");
        let dVals=vals[0].split("-");
        let tVals=vals[1].split(":");
        let currentDate=new Date();
        let mealDate=new Date();
        mealDate.setFullYear(parseInt(dVals[0]));
        mealDate.setMonth(parseInt(dVals[1])-1);
        mealDate.setDate(parseInt(dVals[2]));
        mealDate.setHours(parseInt(tVals[0]));
        mealDate.setMinutes(parseInt(tVals[1]));
        mealDate.setSeconds(0);

        let mealTime=mealDate.getTime();
        let currentTime=currentDate.getTime();
        let remainingMs=mealTime-currentTime;
        let dateStr="";
        let minuteStr="";
        let hourStr="";
        let hours=mealDate.getHours();
        let minutes=mealDate.getMinutes();
        let amPmStr="am";
        if (hours>12){
            hours=hours-12;
            amPmStr="pm";
        }else if (hours==0){
            hours=12;
            amPmStr="am";
        }
        if (minutes<10){
            minuteStr="0"+minutes;
        }else{
            minuteStr=""+minutes;
        }
        if (hours<10){
            hourStr="0"+hours;
        }else{
            hourStr=""+hours;
        }
        let hoursStr=hourStr+":"+minuteStr+" "+amPmStr;
        /*if (mealDate.getFullYear()==currentDate.getFullYear()
            && mealDate.getMonth()==currentDate.getMonth()
            && mealDate.getDate()==currentDate.getDate()){

            //it is today .. now check for day or night
            if (mealDate.getHours()<5 || mealDate.getHours()>=19){
                dateStr="tonight "+hoursStr;
            }else{
                dateStr="today "+hoursStr;
            }
        }else if (mealDate.getFullYear()==currentDate.getFullYear()
            && mealDate.getMonth()==currentDate.getMonth()
            && mealDate.getDate()==(currentDate.getDate()+1)){

            //it is tomorrow .. now check for day or night
            if (mealDate.getHours()<5 || mealDate.getHours()>=19){
                dateStr="tomorrow "+hoursStr;
            }else{
                dateStr="tomorrow "+hoursStr;
            }
        }else{*/
            let dtStr:any=mealDate.getDate();
            if (dtStr<10){
                dtStr="0"+dtStr;
            }
            dateStr=dtStr+" "+this.months[mealDate.getMonth()]+" "+mealDate.getFullYear()+" "+hoursStr;
        //}

        return dateStr;
    }
}