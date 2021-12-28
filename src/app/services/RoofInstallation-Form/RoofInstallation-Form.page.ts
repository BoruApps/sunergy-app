import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
import {ImageSlider} from "../image-slider/image-slider.page";
import { imagePreview } from "../image-preview/image-preview.page";


@Component({
    selector: 'RoofInstallation-Form',
    templateUrl: './RoofInstallation-Form.page.html',
    styleUrls: ['./RoofInstallation-Form.page.scss'],
})
export class RoofInstallationForm implements OnInit {
    modalTitle: string;
    blockname: string;
    modelId: number;
    serviceid: any;
    user_id: any;
    apiurl: any;
    dataReturned: any;
    currentdate: any;
    InstallfieldList: any[] = [];
    localInstallform: any;
    localInstallformdate: any;
    installphoto: any[] = [];
    
    buttonLabels = ['Take Photo', 'Upload from Library'];
    actionOptions: ActionSheetOptions = {
        title: 'Which would you like to do?',
        buttonLabels: this.buttonLabels,
        addCancelButtonWithLabel: 'Cancel',
        androidTheme: 1 //this.actionSheet.ANDROID_THEMES.THEME_HOLO_DARK,
    }
    options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        saveToPhotoAlbum: false //true causes crash probably due to permissions to access library.
    }
    libraryOptions: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }
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
        this.user_id = this.navParams.data.logged_in_user;
        this.modalTitle = this.navParams.data.paramTitle;
        this.currentdate = this.navParams.data.currentdate;
        this.blockname = this.navParams.data.blockname;
        console.log('blockname == ',this.blockname);
        this.InstallfieldList = [];
        this.localInstallform = 'RoofInstallfieldList-'+this.serviceid;
        this.localInstallformdate = 'RoofInstallformdate-'+this.serviceid;
        var storedNames = JSON.parse(localStorage.getItem(this.localInstallform));
        var formsubmitdate = localStorage.getItem(this.localInstallformdate);
        if(storedNames && formsubmitdate == this.currentdate){
            this.InstallfieldList = storedNames;
            console.log('InstallfieldList === ',this.InstallfieldList);
        }else{
        this.InstallfieldList.push({ 
            label : 'Job Number',
            fieldname : 'cf_ele_job_number',
            uitype : 1,
            typeofdata : 'V~O'
        },{ 
            label : 'Comments',
            fieldname : 'cf_comments',
            uitype : 19,
            typeofdata : 'V~O',
        });
        console.log('InstallfieldList == ',this.InstallfieldList);
        }
    }

    loading: any;

    async showLoading() {
        this.loading = await this.loadingController.create({
            message: 'Loading ...'
        });
        return await this.loading.present();
    }

    async hideLoading() {
        setTimeout(() => {
            if(this.loading != undefined){
                this.loading.dismiss();
            }
        }, 1000);
    }
    async closeModal(changes='') {
        localStorage.setItem(this.localInstallform, JSON.stringify(this.InstallfieldList));
        localStorage.setItem(this.localInstallformdate, this.currentdate);
        await this.modalController.dismiss({'formsubmitted':false});
    }
    async presentToast(message: string) {
        var toast = await this.toastController.create({
          message: message,
          duration: 2000,
          position: "top",
          color: "danger",
        });
        toast.present();
      }
    async checkrequiredfields(){
        var flag = 0;
        var extraFlag = 0;
        var fieldlist = [];
        var fieldlistmassge = '';
        for (var i = 0; i < this.InstallfieldList.length; ++i) {
            if(this.InstallfieldList[i]["value"] == 'Yes' && this.InstallfieldList[i]["uitype"] == '444'){
                console.log('step-1');
                if(Array.isArray(this.installphoto[this.InstallfieldList[i]["fieldname"]]) && this.installphoto[this.InstallfieldList[i]["fieldname"]].length > 0){
                console.log('step-2');
                    
                }else{
                    extraFlag = 1;
                console.log('step-3');
                    fieldlist.push(this.InstallfieldList[i]["fieldname"]);
                    fieldlistmassge += 'Please select/upload Image '+this.InstallfieldList[i]["label"] +'\n';
                }
            }
            if(this.InstallfieldList[i]["value"] != '' && this.InstallfieldList[i]["value"] != undefined){
                flag++;
            }else{
                fieldlist.push(this.InstallfieldList[i]["fieldname"]);
                fieldlistmassge += 'This field is Required '+this.InstallfieldList[i]["label"] +'\n';
            }
        }
        console.log(flag, '====', this.InstallfieldList.length);
        if(flag == this.InstallfieldList.length && extraFlag == 0){
            return true;
        }else{
            console.log('fieldlist = ',fieldlist);
            if(fieldlist[0] != 'cf_installer_signature'){
                var input = document.getElementById(fieldlist[0]);
                console.log('input == ',input);
                input.scrollIntoView(true)
            }
            this.presentToast(
                fieldlistmassge
            );
            return false;
        }
    }
    openActionInspection(fieldname) {
        this.actionSheet.show(this.actionOptions).then((buttonIndex: number) => {
            console.log('Option pressed', buttonIndex);
            if (buttonIndex == 1) {
                console.log('launching camera');
                this.camera.getPicture(this.options).then((imageData) => {
                    // imageData is either a base64 encoded string or a file URI
                    // If it's base64 (DATA_URL):
                    let base64Image = 'data:image/png;base64,' + imageData;
                    this.imgpov.setImage(imageData);
                    this.openModal(this.serviceid, base64Image, fieldname);
                    // TODO: need code to upload to server here.
                    // On success: show toast
                    //this.presentToastPrimary('Photo uploaded and added! \n' + imageData);
                }, (err) => {
                    // Handle error
                    console.error(err);
                    // On Fail: show toast
                    this.presentToast(`Upload failed! Please try again \n` + err);
                });
            } else if (buttonIndex == 2) {
                console.log('launching gallery');
                this.camera.getPicture(this.libraryOptions).then((imageData) => {
                    // imageData is either a base64 encoded string or a file URI
                    // If it's base64 (DATA_URL):
                    let base64Image = 'data:image/png;base64,' + imageData;
                    this.imgpov.setImage(imageData);
                    this.openModal(this.serviceid, base64Image, fieldname);
                    // TODO: need code to upload to server here.
                    // On success: show toast
                    //this.presentToastPrimary('Photo uploaded and added! \n' + imageData);
                }, (err) => {
                    // Handle error
                    console.error(err);
                    // On Fail: show toast
                    this.presentToast(`Upload failed! Please try again \n` + err);
                });
            }
        }).catch((err) => {
            let imageData = this.appConst.appTestImg;
            let base64Image = 'data:image/png;base64,' + imageData;
            //console.log(err);
            this.imgpov.setImage(imageData);
            this.openModal(this.serviceid, base64Image, fieldname);
            this.presentToast(`Operation failed! \n` + err);
        });
    }
    async openModal(serviceid, base64Image, fieldname) {
        const modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
                "base64Image": base64Image,
                "paramTitle": "Upload Photo",
                "serviceid": serviceid,
                "user_id": this.user_id,
                "imagefrom": fieldname,
            }
        });

        modal.onDidDismiss().then((dataReturned) => {
                this.dataReturned = dataReturned.data;
            if (dataReturned !== null && this.dataReturned != 'Wrapped Up!') {
                console.log('dataReturned = ',this.dataReturned);
                console.log('instectionservice-fieldname = ',fieldname);
                if(this.installphoto[fieldname] == undefined){
                    this.installphoto[fieldname] = [];
                }
                this.installphoto[fieldname].push(this.dataReturned);
                console.log('instectionservice = ',this.installphoto);
                //alert('Modal Sent Data :'+ dataReturned);
            }
        });

        return await modal.present();
    }
    async submitinstallationcompletionform(){
        var formflag = await this.checkrequiredfields();
        console.log('formflag = ', formflag);
        if(formflag){
            console.log('this.InstallfieldList = ',this.InstallfieldList);
            var headers = new HttpHeaders();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/x-www-form-urlencoded");
            headers.append("Access-Control-Allow-Origin", "*");
            this.showLoading();
            var params = {
                'InstallfieldList': JSON.stringify(this.InstallfieldList),
                'recordid': this.serviceid,
                'logged_in_user': this.user_id,
                'blockname': this.blockname,
            };
            this.httpClient
            .post(this.apiurl + "saveRoofInstallationform.php", params, {
              headers: headers,
              observe: "response",
            })
            .subscribe(
              (data) => {
                this.hideLoading();
                var success = data["body"]["success"];
                console.log(data["body"]);
                if (success == true) {
                    console.log("Saved and updated data for workorder");
                    //this.clearPad();
                    localStorage.setItem(this.localInstallform, JSON.stringify(this.InstallfieldList));
                    localStorage.setItem(this.localInstallformdate, this.currentdate);
                    this.modalController.dismiss({'formsubmitted':true});
                } else {
                  this.presentToast("Failed to save due to an error");
                  console.log("failed to save record, response was false");
                }
              },
              (error) => {
                this.presentToast(
                  "Failed to save due to an error \n" + error.message
                );
                console.log("failed to save record", error.message);
              }
            );
        }
    }
    addUpdate(event, extra=null) {
        var fieldname = event.target.name;
        if (!fieldname || fieldname == "" || fieldname == undefined) {
          fieldname = event.target.id;
        }
        var fieldvalue = event.target.textContent + event.target.value;
        if (event.target.tagName == "ION-RADIO" || event.target.tagName == "ION-CHECKBOX" || event.target.tagName == "ION-DATETIME" || event.target.tagName == "ION-TEXTAREA" || event.target.tagName == "ION-SELECT")
        {
          fieldvalue = event.target.value;
        }
        if(extra == 444 && fieldvalue == 'Yes'){
            console.log('Need to display Image', fieldname);
            var input = document.getElementById('cf_all_grounding_photos');
            document.body.classList.toggle('cf_all_grounding_photos', true);
        }else{
            console.log('No Need to display Image', fieldname);
            var input = document.getElementById('cf_all_grounding_photos');
            document.body.classList.toggle('cf_all_grounding_photos', false);
        }
        this.setValuetoInstallfield(fieldname, fieldvalue);
        console.log('tagName = ',event.target.tagName);
        console.log('fieldname = ',fieldname);
        console.log('fieldvalue = ',fieldvalue);
        console.log('InstallfieldList == ',this.InstallfieldList);
  }
  updateCheckedOptions(option, event) {
        var fieldname = event.target.name;
        console.log('InstallfieldList-length = ',this.InstallfieldList.length);
        var flag = 0;
        for (var i = 0; i < this.InstallfieldList.length; ++i) {
            if(this.InstallfieldList[i].fieldname === fieldname){
                if(event.target.checked){
                    if(!Array.isArray(this.InstallfieldList[i]["value"])){
                        this.InstallfieldList[i]["value"] = [];
                    }
                    if(!this.InstallfieldList[i]["value"].includes(option)){
                        this.InstallfieldList[i]["value"].push(option);
                    }
                }else{
                    var index =this.InstallfieldList[i]["value"].indexOf(option);
                    if (index !== -1) {
                      this.InstallfieldList[i]["value"].splice(index, 1);
                    }
                }
            }
            if(this.InstallfieldList[i]["value"] != ''){
                flag++;
            }
        }
        console.log('flag = ',flag);
        console.log('InstallfieldList = ',this.InstallfieldList);
    }
    setValuetoInstallfield(fieldname, value){
        var flag = 0;
        for (var i = 0; i < this.InstallfieldList.length; ++i) {
            if(this.InstallfieldList[i].fieldname === fieldname){
                this.InstallfieldList[i]["value"] = value;
            }
            if(this.InstallfieldList[i]["value"] != '' && this.InstallfieldList[i]["value"] != undefined){
                flag++;
            }
        }
        console.log('setValuetoInstallfield - flag = ',flag);
    }
    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
          return false;
        }
        return true;

      }
}