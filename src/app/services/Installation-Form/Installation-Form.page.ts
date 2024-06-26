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
import SignaturePad from 'signature_pad';

@Component({
    selector: 'Installation-Form',
    templateUrl: './Installation-Form.page.html',
    styleUrls: ['./Installation-Form.page.scss'],
})
export class InstallationForm implements OnInit {
    modalTitle: string;
    blockname: string;
    modelId: number;
    serviceid: any;
    user_id: any;
    apiurl: any;
    dataReturned: any;
    cust_firstname: any;
    cust_lastname: any;
    localInstallform: any;
    currentdate: any;
    localInstallformdate: any;
    cf_install_date: any;
    InstallfieldList: any[] = [];
    installphoto: any[] = [];
    btnsubmitInstallform: number;
    signaturePad: SignaturePad;
      @ViewChild('canvas',{static:false}) canvasEl : ElementRef;
      signatureImg: string;
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

    ngAfterViewInit() {
        this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
      }

      startDrawing(event: Event) {
        console.log('startDrawing = ',event);
        this.setValuetoInstallfield('cf_installer_signature', 'signature');
        // works in device not in browser

      }

      moved(event: Event) {
        // works in device not in browser
      }

      clearPad() {
        this.signaturePad.clear();
        this.setValuetoInstallfield('cf_installer_signature', '');
      }

      savePad() {
        const base64Data = this.signaturePad.toDataURL();
        this.signatureImg = base64Data;
      }
    ngOnInit() {
        // console.table(this);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.user_id = this.navParams.data.logged_in_user;
        this.modalTitle = this.navParams.data.paramTitle;
        this.currentdate = this.navParams.data.currentdate;
        this.cust_firstname = this.navParams.data.cust_firstname;
        this.cust_lastname = this.navParams.data.cust_lastname;
        this.blockname = this.navParams.data.blockname;
        console.log(' ========appConst.my log workOrder == ',this.appConst.workOrder);
        this.InstallfieldList = [];
        this.btnsubmitInstallform = 1;
        this.localInstallform = 'InstallfieldList-'+this.serviceid;
        this.localInstallformdate = 'Installformdate-'+this.serviceid;
        console.log('localInstallform = ',this.localInstallform);
        var storedNames = JSON.parse(localStorage.getItem(this.localInstallform));
        var formsubmitdate = localStorage.getItem(this.localInstallformdate);
        if(storedNames && formsubmitdate == this.currentdate){
            this.InstallfieldList = storedNames;
            console.log('InstallfieldList === ',this.InstallfieldList);
        }else{
            this.InstallfieldList.push({ 
                label : 'Install Date',
                fieldname : 'cf_install_date',
                uitype : 5,
                typeofdata : 'D~O',
                value : this.currentdate
            },{ 
                label : 'Sunergy Office Location',
                fieldname : 'cf_office_ocation',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['SoCal', 'NorCal', 'CentralCal'],
            },{ 
                label : 'Customer First Name',
                fieldname : 'cf_cut_first_name',
                uitype : 1,
                typeofdata : 'V~O',
                value : this.cust_firstname
            },{ 
                label : 'Customer Last Name',
                fieldname : 'cf_cut_last_name',
                uitype : 1,
                typeofdata : 'V~O',
                value : this.cust_lastname
            },{ 
                label : 'Was Customer Home?',
                fieldname : 'cf_was_cus_home',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Lead Installer on Site',
                fieldname : 'cf_lead_install_site',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['Miguel Mendoza','Augistine','Raymond Labelle','Anthony Ortiz','Douglas Moreno','John Granda','Jesse Cook','Mike Smith','Travis Li','Trevor','Armando R','Michael Sanchez'],
            },{ 
                label : 'How Many on Crew?',
                fieldname : 'cf_many_crew',
                uitype : 111,
                typeofdata : 'I~O',
            },{ 
                label : 'System Size KW',
                fieldname : 'cf_system_size',
                uitype : 111,
                typeofdata : 'I~O',
            },{ 
                label : 'Panel Qty',
                fieldname : 'cf_panel_qty',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Panels Watts/Type',
                fieldname : 'cf_panel_watts_type',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Inverter Qty',
                fieldname : 'cf_inverter_qty',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Inverter Watts/Type',
                fieldname : 'cf_inverter_watts_type',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Optimizers Qty',
                fieldname : 'cf_optimizers_qty',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Optimizers Watts/Type',
                fieldname : 'cf_optimizers_watts_type',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Racking Qty',
                fieldname : 'cf_racking_qty',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Racking Watts/Type',
                fieldname : 'cf_racking_watts_type',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Was OT Needed To Finish?',
                fieldname : 'cf_ot_finish',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Time Arrived',
                fieldname : 'cf_time_arrived',
                uitype : 2,
                typeofdata : 'V~O',
            },{ 
                label : 'Time Finished',
                fieldname : 'cf_time_finished',
                uitype : 2,
                typeofdata : 'V~O',
            },{ 
                label : 'Hours On Site',
                fieldname : 'cf_hours_site',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Accidents/Injury\'s On The Job?',
                fieldname : 'cf_acc_inj_job',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Non Injury Reporting Completed?',
                fieldname : 'cf_non_inj_rep',
                uitype : 33,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'JHA Completed For Job?',
                fieldname : 'cf_jha_completed_job',
                uitype : 33,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'All Sunrun Photos Taken?',
                fieldname : 'cf_all_sunrun_photo',
                uitype : 33,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Did Your Crew Fix Missed Punches',
                fieldname : 'cf_crew_fix_missed',
                uitype : 33,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Was Job Build Per Plan',
                fieldname : 'cf_job_build_plan',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No','Plans Incorrect'],
            },{ 
                label : 'What Changed / Was Incorrect',
                fieldname : 'cf_what_incorrect',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['None','Layout', 'Single Line','Roof Type','Equipment/Material','Inverter Location','Conduit Size/Type','Other - Please Explain'],
            },{ 
                label : 'All Feet And Rail Installed?',
                fieldname : 'cf_feet_rail_install',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'All Optimizers/Micros Installed?',
                fieldname : 'cf_optimizers_micros_install',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Panels installed?',
                fieldname : 'cf_panel_install',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'J-Box & Conduit Installed?',
                fieldname : 'cf_jbox_conduit',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Panel Stringing Complete?',
                fieldname : 'cf_panel_stringing',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Roof Conduit Painted?',
                fieldname : 'cf_roof_conduit',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Inverter & Disconnect Installed?',
                fieldname : 'cf_inverter_disconnect',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'System Tied to inverter?',
                fieldname : 'cf_system_tied',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Disconnect Tied to MPU?',
                fieldname : 'cf_discconnect_tied_mpu',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'All Grounding/Bonding Completed (Take Photos)?',
                fieldname : 'cf_all_grounding',
                uitype : 444,
                typeofdata : 'V~O',
                value : 'Image',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'How Many Ground Rods Installed?',
                fieldname : 'cf_many_ground_rod',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['1', '2'],
            },{ 
                label : 'Was there a Ufer on site?',
                fieldname : 'cf_wasufersite',
                uitype : 33,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Correct PV Breaker Installed (Take Photos)?',
                fieldname : 'cf_correct_pv_breaker',
                uitype : 444,
                typeofdata : 'V~O',
                value : 'Image',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'MPU Upgrade Needed?',
                fieldname : 'cf_mpu_upgrade',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'MPU Completed?',
                fieldname : 'cf_mpu_completed',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'MPU Completed Other?',
                fieldname : 'cf_mpu_completed_other',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Derate Needed?',
                fieldname : 'cf_derate_needed',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'System Working Properly?',
                fieldname : 'cf_system_working',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['Yes','No','Other'],
            },{ 
                label : 'System Working Properly Other?',
                fieldname : 'cf_system_working_other',
                uitype : 1,
                typeofdata : 'V~O',
            },{ 
                label : 'Optimizers/Micros Paired (Take Photos)?',
                fieldname : 'cf_micros_paired',
                uitype : 444,
                typeofdata : 'V~O',
                value : 'Image',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Monitoring Map completed (Take Photo)?',
                fieldname : 'cf_monitoring_map',
                uitype : 444,
                typeofdata : 'V~O',
                value : 'Image',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Job Site Clean (Take Photo)?',
                fieldname : 'cf_job_site_clean',
                uitype : 444,
                typeofdata : 'V~O',
                value : 'Image',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Sample of Broken Tiles Taken?',
                fieldname : 'cf_broken_tiles',
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'How many broken tiles?',
                fieldname : 'cf_how_many_broken_tiles',
                uitype : 1,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Installation Status',
                fieldname : 'cf_installation_status',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['Install Ready For inspection','Incomplete (1 More Day)','Incomplete (Weather)','Incomplete (needs Service)','Pending MPU Install','Pending Battery Install'],
            },{ 
                label : 'Comments',
                fieldname : 'cf_comments',
                uitype : 19,
                typeofdata : 'V~O',
            },{ 
                label : 'Lead Installer Signature',
                fieldname : 'cf_installer_signature',
                uitype : 999,
                typeofdata : 'V~O',
            });
        }
        
        console.log('InstallfieldList == ',this.InstallfieldList);
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
        console.log('closeModal == ',localStorage.getItem(this.localInstallform))
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
        var index = 0;
        if(fieldname == 'cf_all_grounding'){
            var index = 0;
        }else if(fieldname == 'cf_correct_pv_breaker'){
            var index = 1;
        }else if(fieldname == 'cf_micros_paired'){
            var index = 2;
        }else if(fieldname == 'cf_monitoring_map'){
            var index = 3;
        }else if(fieldname == 'cf_job_site_clean'){
            var index = 4;
        }
        var mainfieldname = 'cf_2303';
        var section = 0;
        this.actionSheet.show(this.actionOptions).then((buttonIndex: number) => {
            console.log('Option pressed', buttonIndex);
            if (buttonIndex == 1) {
                console.log('launching camera');
                this.camera.getPicture(this.options).then((imageData) => {
                    // imageData is either a base64 encoded string or a file URI
                    // If it's base64 (DATA_URL):
                    let base64Image = 'data:image/png;base64,' + imageData;
                    this.imgpov.setImage(imageData);
                    this.openModal(this.serviceid, base64Image, mainfieldname, index, section, fieldname);
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
                    this.openModal(this.serviceid, base64Image, mainfieldname, index, section, fieldname);
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
            this.openModal(this.serviceid, base64Image, mainfieldname, index, section, fieldname);
            this.presentToast(`Operation failed! \n` + err);
        });
    }
    async openModal(serviceid, base64Image, mainfieldname, index, section, fieldname) {
        const modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
                "base64Image": base64Image,
                "paramTitle": "Upload Photo",
                "serviceid": serviceid,
                "user_id": this.user_id,
                "columnIndex": index,
                "imagefrom": mainfieldname,
                "columnname": mainfieldname,
                "subSection": section
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
            const base64Data = this.signaturePad.toDataURL();
            this.signatureImg = base64Data;
            var base64Datapost = base64Data.split(',')[1];
            // 'base64Image': base64Datapost,
            this.showLoading();
            var params = {
                'base64Image': base64Datapost,
                'InstallfieldList': JSON.stringify(this.InstallfieldList),
                'recordid': this.serviceid,
                'logged_in_user': this.user_id,
                'blockname': this.blockname,
            };
            this.httpClient
            .post(this.apiurl + "saveInstallationform.php", params, {
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
                    //localStorage.removeItem(this.localInstallform);
                    this.clearPad();
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
            if(extra == 444){
                fieldvalue = 'No Images';
            }
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
        if(flag == this.InstallfieldList.length){
            this.btnsubmitInstallform = 1;
        }else{
            //this.btnsubmitInstallform = 0;
        }
        console.log('flag = ',flag);
        console.log('InstallfieldList = ',this.InstallfieldList);
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
            if(this.InstallfieldList[i].fieldname == 'cf_time_arrived'){
                timearrived = this.InstallfieldList[i]["value"]
            }
            if(this.InstallfieldList[i].fieldname == 'cf_time_finished'){
                timefinished = this.InstallfieldList[i]["value"]
            }
            if(this.InstallfieldList[i].fieldname == 'cf_hours_site'){
                old_hours_site = this.InstallfieldList[i]["value"]
            }
        }
        if(timefinished != '' && timefinished != undefined && timearrived != '' && timearrived != undefined){
            console.log('timearrived == ',timearrived);
            console.log('timefinished == ',timefinished);
            var timeDiff = this.getDataDiff(new Date(timearrived), new Date(timefinished));
            console.log('timeDiff == ',timeDiff);
            var hours_site = timeDiff.hour+" hours "+ timeDiff.minute +" minutes ";
            console.log('hours_site = ',hours_site);
            console.log('old_hours_site = ',old_hours_site);
            if(hours_site != old_hours_site){
                this.setValuetoInstallfield('cf_hours_site', hours_site);
            }
        }
        if(flag == this.InstallfieldList.length){
            this.btnsubmitInstallform = 1;
        }else{
            //this.btnsubmitInstallform = 0;
        }
        console.log('setValuetoInstallfield - flag = ',flag);
    }
    getDataDiff(startDate, endDate) {
        var diff = endDate.getTime() - startDate.getTime();
        var days = Math.floor(diff / (60 * 60 * 24 * 1000));
        var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
        var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
        var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
        return { day: days, hour: hours, minute: minutes, second: seconds };
    }
    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
          return false;
        }
        return true;

      }
}
