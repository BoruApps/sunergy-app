import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {IonicStorageModule} from '@ionic/storage';
import {Camera, CameraOptions} from '@ionic-native/camera/ngx';
import {ActionSheet, ActionSheetOptions} from '@ionic-native/action-sheet/ngx';
import {PhotoLibrary} from '@ionic-native/photo-library/ngx';
import {HttpClientModule} from '@angular/common/http';
import {FileTransfer} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file/ngx';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {ImageProvider} from './providers/image/image';
import {AppConstants} from './providers/constant/constant';
import {GoogleMaps} from '@ionic-native/google-maps';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import {Crop} from '@ionic-native/crop/ngx';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule, IonicStorageModule.forRoot()],
    providers: [
        StatusBar,
        SplashScreen,
        GoogleMaps,
        InAppBrowser,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        Camera,
        PhotoViewer,
        ActionSheet,
        PhotoLibrary,
        FileTransfer,
        File,
        ImageProvider,
        AppConstants,
        Crop
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
