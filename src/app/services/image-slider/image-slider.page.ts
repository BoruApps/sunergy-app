import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, NavParams, ToastController, PickerController, NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConstants } from '../../providers/constant/constant';
import { LoadingController } from '@ionic/angular';
import {ImageModalPage} from "../image-modal/image-modal.page";
import {ActionSheet, ActionSheetOptions} from '@ionic-native/action-sheet/ngx';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer} from '@angular/platform-browser';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: "image-slider",
  templateUrl: "./image-slider.page.html",
  styleUrls: ["./image-slider.page.scss"],
})
export class ImageSlider implements OnInit {
  modelId: number;
  apiurl: any;
  user_id: any;
  serviceid: any;
  dataReturned: any;
  defaultContent: any;
  currentImage: any;
  allSliderImages: any = {};

  constructor(
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

@ViewChild('sliderRef', { static: true }) protected sliderRef: IonSlides

async ngOnInit() {
    // console.table(this);
    this.modelId = this.navParams.data.paramID;
    this.user_id = this.navParams.data.user_id;
    this.serviceid = this.navParams.data.serviceid;
    this.allSliderImages = this.navParams.data.sliderImages;
    this.currentImage = this.navParams.data.currentImage;

    this.sliderRef.update();
    var currentImageId = this.currentImage['documentid'];
    var position = this.allSliderImages.findIndex(
        function (obj, key) {
          return obj.documentid === currentImageId;
      }
      );

    if (position > -1) {
      this.sliderRef.slideTo(position)
  }
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

async openViewModal() {
    var image = await this.sliderRef.getActiveIndex();
    var params = {
      documentid: this.allSliderImages[image].documentid,
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
                documentid: this.allSliderImages[image].documentid,
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
          base64Image: this.allSliderImages[image],
          paramTitle: "View Photo",
          serviceid: this.serviceid,
          columnname: "",
          is_delete: false,
      },
  });

      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned !== null) {
          if (dataReturned.data["is_delete"]) {
            for (let noteItemindex in this.allSliderImages) {
              var position = this.allSliderImages[noteItemindex].images.findIndex(
                function (obj, key) {
                  return obj.image_id === dataReturned.data["documentid"];
              }
              );

              if (position > -1) {
                this.allSliderImages[noteItemindex].images.splice(position, 1);
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
