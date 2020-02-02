import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SplashPage } from '../pages/splash/splash';
import { SignupPage } from '../pages/signup/signup';
import { UiHelper } from '../services/uihelper';
import { AppServer } from '../services/appserver';
import { AppGlobals } from '../services/appglobals';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';

import { FileTransfer } from '@ionic-native/file-transfer';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ProfilePage } from '../pages/profile/profile';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { ClaimStorePage } from '../pages/claim-store/claim-store';
import { UpgradePackagePage } from '../pages/upgrade-package/upgrade-package';
import { AddPaymentPage } from '../pages/add-payment/add-payment';
import { StoreDetailPage } from '../pages/store-detail/store-detail';
import { HomeTabPage } from '../pages/home-tab/home-tab';
import { WheredaweedFooter } from '../components/wheredaweed-footer/wheredaweed-footer';

import { PayPal } from '@ionic-native/paypal/ngx';

@NgModule({
    declarations: [
        MyApp,
        SplashPage,
        LoginPage,
        ForgotPasswordPage,
        SignupPage,
        HomeTabPage,
        HomePage,
        StoreDetailPage,
        ProfilePage,
        EditProfilePage,
        ClaimStorePage,
        UpgradePackagePage,
        AddPaymentPage,

        WheredaweedFooter,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        SplashPage,
        LoginPage,
        ForgotPasswordPage,
        SignupPage,
        HomeTabPage,
        HomePage,
        StoreDetailPage,
        ProfilePage,
        EditProfilePage,
        ClaimStorePage,
        UpgradePackagePage,
        AddPaymentPage,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        UiHelper,AppServer,AppGlobals,
        File,FileTransfer,FilePath,Camera,Geolocation,PayPal,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {}
