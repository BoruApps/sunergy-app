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
  selector: "image-gallery",
  templateUrl: "./image-gallery.page.html",
  styleUrls: ["./image-gallery.page.scss"],
})
export class ImageGallery implements OnInit {
  modalTitle: string;
  modelId: number;
  serviceName:any;
  serviceid: any;
  apiurl: any;
  user_id: any;
  dataReturned: any;
  defaultContent: any;
  allImages: any = {};

  buttonLabels = ["Take Photo", "Upload from Library"];

  actionOptions: ActionSheetOptions = {
    title: "Which would you like to do?",
    buttonLabels: this.buttonLabels,
    addCancelButtonWithLabel: "Cancel",
    androidTheme: 1, //this.actionSheet.ANDROID_THEMES.THEME_HOLO_DARK,
  };

  options: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    saveToPhotoAlbum: false, //true causes crash probably due to permissions to access library.
  };

  libraryOptions: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  };

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
    // console.table(this);
    this.modelId = this.navParams.data.paramID;
    this.serviceid = this.navParams.data.serviceid;
    this.modalTitle = this.navParams.data.paramTitle;
    this.user_id = this.navParams.data.user_id;
    this.serviceName = this.navParams.data.serviceName;
    this.loadImages(this.serviceid);
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

  /* Default Auth Guard and Theme Loader */

  loadImages(recordid) {
    var params = {
      recordid: recordid,
      columnname: "",
    };
    console.log("fetching documents for", params);
    var headers = new HttpHeaders();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Access-Control-Allow-Origin", "*");
    this.showLoading();
    this.httpClient
      .post(this.apiurl + "getPhotos.php", params, {
        headers: headers,
        observe: "response",
      })
      .subscribe(
        (data) => {
          console.log(data["body"]);
          var success = data["body"]["success"];
          console.log("fetching photos response was", success);
          if (success == true) {
            this.allImages = data["body"]["data"];
            console.log("this.allImages", this.allImages);
          } else {
            console.log("fetch photos failed");
            this.hideLoading();
          }
          this.hideLoading();
        },
        (error) => {
          this.hideLoading();
          console.log("fetch errored out", error);
        }
      );
  }

  async openViewModal(image) {
    var params = {
      documentid: image.documentid,
    };

    var headers = new HttpHeaders();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    headers.append("Access-Control-Allow-Origin", "*");
    this.showLoading();
    await this.httpClient
      .post(this.apiurl + "getDocBase64.php", params, {
        headers: headers,
        observe: "response",
      })
      .subscribe(
        async (data) => {
          this.hideLoading();
          //console.log(data['body']);
          var success = data["body"]["success"];
          if (success == true) {
            var modal = await this.modalCtrl.create({
              component: ImageModalPage,
              componentProps: {
                base64Image: data["body"]["base64"],
                paramTitle: "View Photo",
                serviceid: this.serviceid,
                columnname: "",
                is_delete: false,
                documentid: image.documentid,
                fileName: data["body"]["fileName"].split(".")[0],
              },
            });
            modal.onDidDismiss().then((dataReturned) => {
              if (dataReturned !== null) {
                // this.dataReturned = dataReturned.data;
                //alert('Modal Sent Data :'+ dataReturned);
              }
            });

            return await modal.present();
          }
        },
        async (error) => {
          var modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
              base64Image: image.imgpath,
              paramTitle: "View Photo",
              serviceid: this.serviceid,
              columnname: "",
              is_delete: false,
            },
          });
          modal.onDidDismiss().then((dataReturned) => {
            if (dataReturned !== null) {
              if (dataReturned.data["is_delete"]) {
                for (let noteItemindex in this.allImages) {
                  var position = this.allImages[noteItemindex].images.findIndex(
                    function (obj, key) {
                      return obj.image_id === dataReturned.data["documentid"];
                    }
                  );

                  if (position > -1) {
                    this.allImages[noteItemindex].images.splice(position, 1);
                  }
                }
              }
            }
          });

          return await modal.present();
          this.hideLoading();
          console.log("failed to fetch record");
        }
      );
  }

  async closeModal() {
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
