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
    selector: 'ElectricalInstallation-Form',
    templateUrl: './ElectricalInstallation-Form.page.html',
    styleUrls: ['./ElectricalInstallation-Form.page.scss'],
})
export class ElectricalInstallationForm implements OnInit {
    modalTitle: string;
    blockname: string;
    modelId: number;
    serviceid: any;
    user_id: any;
    apiurl: any;
    dataReturned: any;
    currentdate: any;
    fulldatetime: any;
    cf_job_id: any;
    cust_firstname: any;
    cust_lastname: any;
    user_firstname: any;
    user_lastname: any;
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
        this.fulldatetime = this.navParams.data.fulldatetime;
        this.cf_job_id = this.navParams.data.cf_job_id;
        console.log('cf_job_id ==== ',this.cf_job_id);
        this.cust_firstname = this.navParams.data.cust_firstname;
        this.cust_lastname = this.navParams.data.cust_lastname;
        this.user_firstname = this.navParams.data.user_firstname;
        this.user_lastname = this.navParams.data.user_lastname;
        this.blockname = this.navParams.data.blockname;
        console.log('blockname == ',this.blockname);
        this.InstallfieldList = [];
        this.localInstallform = 'ElectricalInstallfieldList-'+this.serviceid;
        this.localInstallformdate = 'ElectricalInstallformdate-'+this.serviceid;
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
            typeofdata : 'V~O',
            value: this.cf_job_id
        },{ 
            label : 'Date',
            fieldname : 'cf_ele_datetime',
            uitype : 5,
            typeofdata : 'D~O',
            value:this.currentdate
        },{ 
            label : 'Time',
            fieldname : 'cf_ele_time',
            uitype : 2,
            typeofdata : 'T~O',
            value: this.fulldatetime,
        },{ 
            label : 'Customer First Name',
            fieldname : 'cf_ele_cut_first_name',
            uitype : 1,
            typeofdata : 'V~O',
            value: this.cust_firstname,
        },{ 
            label : 'Customer Last Name',
            fieldname : 'cf_ele_cut_last_name',
            uitype : 1,
            typeofdata : 'V~O',
            value: this.cust_lastname,
        },{ 
            label : 'Was Customer Home?',
            fieldname : 'cf_ele_was_cus_home',
            uitype : 555,
            typeofdata : 'V~O',
            picklistvalues : ['Yes', 'No'],
        },{ 
            label : 'Lead Electrician on Site',
            fieldname : 'cf_ele_lead_ele_site',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['Luis Vazquez','Larry Wagon','Jerry Miller','Raymond Labelle','Danny Banuelos','Alex Ortega','Travis Li','Trevor Lee'],
        },{ 
            label : 'How Many on Crew?',
            fieldname : 'cf_ele_many_crew',
            uitype : 111,
            typeofdata : 'I~O',
        },{ 
            label : 'MPU Details',
            fieldname : 'cf_ele_mpu_details',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['125a/100a Breaker', '200a/200a Breaker', '225a/200a Breaker', '400a/Split 200a Breaker'],
        },{ 
            label : 'Over / Under',
            fieldname : 'cf_ele_over_under',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['Overhead Feed', 'Underground Feed']
        },{ 
            label : 'Mounting Type',
            fieldname : 'cf_ele_mounting_type',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['Surface', 'Flush'],
        },{ 
            label : 'Disco/Reco?',
            fieldname : 'cf_ele_disco_reco',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Was OT Needed to Finish?',
            fieldname : 'cf_ele_was_neededfinish',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Was OT Approved?',
            fieldname : 'cf_ele_otapproved',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Approved By',
            fieldname : 'cf_ele_approvedby',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['Matt', 'Jonathan', 'Erica', 'Richard'],
        },{ 
            label : 'Time Arrived',
            fieldname : 'cf_ele_time_arrived',
            uitype : 2,
            typeofdata : 'V~O',
        },{ 
            label : 'Time Finished',
            fieldname : 'cf_ele_time_finished',
            uitype : 2,
            typeofdata : 'V~O',
        },{ 
            label : 'Hours On Site',
            fieldname : 'cf_ele_hours_on_site',
            uitype : 111,
            typeofdata : 'I~O',
        },{ 
            label : 'Was Inspection Scheduled',
            fieldname : 'cf_ele_wasscheduled',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Inspection Results',
            fieldname : 'cf_ele_ins_results',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['Pass', 'Fail', 'Reschedule'],
        },{ 
            label : 'All Bonding Completed?',
            fieldname : 'cf_ele_bonding_comd',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'All correct Breakers Installed?',
            fieldname : 'cf_ele_breakers_ind',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Correct PV Breaker Installed?',
            fieldname : 'cf_ele_pv_breaker_ind',
            uitype : 555,
            typeofdata : 'I~O',
        },{ 
            label : 'Derated Needed?',
            fieldname : 'cf_ele_derated_needed',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Derate Completed?',
            fieldname : 'cf_ele_derate_completed',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Lath completed?',
            fieldname : 'cf_ele_lath_completed',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Was Site Cleaned?',
            fieldname : 'cf_ele_site_cleaned',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Were Necessary Photos Taken?',
            fieldname : 'cf_ele_were_necessary',
            uitype : 555,
            typeofdata : 'V~O',
        },{ 
            label : 'Is Job Ready For Inspection?',
            fieldname : 'cf_ele_is_job_ready',
            uitype : 555,
            typeofdata : 'V~O',
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
            var index = 0;
            var mainfieldname = 'cf_2321';
            var section = 0;
            var params = {
                'InstallfieldList': JSON.stringify(this.InstallfieldList),
                'workorderfielddata': JSON.stringify(this.appConst.workOrder[this.serviceid][mainfieldname]),
                'recordid': this.serviceid,
                'columnname': mainfieldname,
                'fieldindex': index,
                'section': section,
                'logged_in_user': this.user_id,
                'blockname': this.blockname,
            };
            this.httpClient
            .post(this.apiurl + "saveElectricalInstallationform.php", params, {
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
                    var images_details = data["body"]["data"]["images_details"];
                    this.appConst.workOrder[this.serviceid][mainfieldname] = images_details;
                    this.appConst.workOrder[this.serviceid][mainfieldname]["complete_category"] = 'yes';
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
    getDataDiff(startDate, endDate) {
        var diff = endDate.getTime() - startDate.getTime();
        var days = Math.floor(diff / (60 * 60 * 24 * 1000));
        var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
        var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
        var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
        return { day: days, hour: hours, minute: minutes, second: seconds };
    }
    setValuetoInstallfield(fieldname, value){
        var flag = 0;
        var timearrived = '';
        var timefinished = '';
        var old_hours_site = '';
        for (var i = 0; i < this.InstallfieldList.length; ++i) {
            if(this.InstallfieldList[i].fieldname === fieldname){
                this.InstallfieldList[i]["value"] = value;
            }
            if(this.InstallfieldList[i]["value"] != '' && this.InstallfieldList[i]["value"] != undefined){
                flag++;
            }
            if(this.InstallfieldList[i].fieldname == 'cf_ele_time_arrived'){
                timearrived = this.InstallfieldList[i]["value"]
            }
            if(this.InstallfieldList[i].fieldname == 'cf_ele_time_finished'){
                timefinished = this.InstallfieldList[i]["value"]
            }
            if(this.InstallfieldList[i].fieldname == 'cf_ele_hours_on_site'){
                old_hours_site = this.InstallfieldList[i]["value"]
            }
        }
        if(timefinished != '' && timefinished != undefined && timearrived != '' && timearrived != undefined){
            var timeDiff = this.getDataDiff(new Date(timearrived), new Date(timefinished));
            console.log('timeDiff == ',timeDiff);
            var hours_site = timeDiff.hour+" hours "+ timeDiff.minute +" minutes ";
            if(hours_site != old_hours_site){
                this.setValuetoInstallfield('cf_ele_hours_on_site', hours_site);
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
