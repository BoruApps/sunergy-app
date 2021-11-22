import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController, PickerController, NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConstants } from '../../providers/constant/constant';
import { LoadingController } from '@ionic/angular';
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import {ImageProvider} from "../../providers/image/image";
import {ImageModalPage} from "../image-modal/image-modal.page";
import {ActionSheet, ActionSheetOptions} from '@ionic-native/action-sheet/ngx';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: "image-preview",
  templateUrl: "./image-preview.page.html",
  styleUrls: ["./image-preview.page.scss"],
})
export class imagePreview implements OnInit {
  modalTitle: string;
  modelId: number;
  imageFullpath:any;
  apiurl: any;
  user_id: any;
  dataReturned: any;
  defaultContent: any;
  
  constructor(
    private camera: Camera,
    private photoviewer: PhotoViewer,
    public imgpov: ImageProvider,
    public modalCtrl: ModalController,
    private modalController: ModalController,
    private navParams: NavParams,
    public httpClient: HttpClient,
    public toastController: ToastController,
    private navCtrl: NavController,
    public appConst: AppConstants,
    private router: Router,
    public loadingController: LoadingController,
    private actionSheet: ActionSheet,
    private sanitizer: DomSanitizer
  ) {
    this.apiurl = this.appConst.getApiUrl();
    this.sanitizer = sanitizer;
  }

  ngOnInit() {
     console.table('welcome to this');
    this.modelId = this.navParams.data.paramID;
    this.modalTitle = this.navParams.data.paramTitle;
    this.user_id = this.navParams.data.user_id;
    this.imageFullpath = this.navParams.data.imageFullpath;
    console.log('this - imageFullpath = ',this.imageFullpath);
  }
  loading: any;

  async showLoading() {
    this.loading = await this.loadingController.create({
      message: "Loading ...",
    });
    return await this.loading.present();
  }

  async hideLoading() {
    setTimeout(() => {
      if (this.loading != undefined) {
        this.loading.dismiss();
      }
    }, 1000);
  }

  urlSanitize(url) {
    console.log(url);
    url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    console.log(url);
    return url;
  }
  async closeModal(changes='') {
      await this.modalController.dismiss({});
    }
  async presentToast(message: string) {
    var toast = await this.toastController.create({
      message: message,
      duration: 3500,
      position: "bottom",
      color: "danger",
    });
    toast.present();
  }

  async presentToastPrimary(message: string) {
    var toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: "bottom",
      color: "primary",
    });
    toast.present();
  }
}
