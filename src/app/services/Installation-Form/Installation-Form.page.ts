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
    modelId: number;
    serviceid: any;
    user_id: any;
    apiurl: any;
    dataReturned: any;
    localInstallform: any;
    cf_install_date: any;
    InstallfieldList: any[] = [];
    btnsubmitInstallform: number;
    signaturePad: SignaturePad;
      @ViewChild('canvas',{static:false}) canvasEl : ElementRef;
      signatureImg: string;

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
        this.InstallfieldList = [];
        this.btnsubmitInstallform = 1;
        this.localInstallform = 'InstallfieldList-'+this.serviceid;
        console.log('localInstallform = ',this.localInstallform);
        var storedNames = JSON.parse(localStorage.getItem(this.localInstallform));
        if(storedNames){
            this.InstallfieldList = storedNames;
            console.log('InstallfieldList === ',this.InstallfieldList);
        }else{
            this.InstallfieldList.push({ 
                label : 'Install Date',
                fieldname : 'cf_install_date',
                uitype : 5,
                typeofdata : 'D~O'
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
                typeofdata : 'V~O'
            },{ 
                label : 'Customer Last Name',
                fieldname : 'cf_cut_last_name',
                uitype : 1,
                typeofdata : 'V~O'
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
                uitype : 111,
                typeofdata : 'I~O',
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
                picklistvalues : ['Layout', 'Single Line','Roof Type','Equipment/Material','Inverter Location','Conduit Size/Type','Other - Please Explain'],
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
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'How Many Ground Rods Installed?',
                fieldname : 'cf_many_ground_rod',
                uitype : 15,
                typeofdata : 'V~O',
                picklistvalues : ['1', '2'],
            },{ 
                label : 'Correct PV Breaker Installed (Take Photos)?',
                fieldname : 'cf_correct_pv_breaker',
                uitype : 555,
                typeofdata : 'V~O',
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
                uitype : 555,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Monitoring Map completed (Take Photo)?',
                fieldname : 'cf_monitoring_map',
                uitype : 33,
                typeofdata : 'V~O',
                picklistvalues : ['Yes', 'No'],
            },{ 
                label : 'Job Site Clean (Take Photo)?',
                fieldname : 'cf_job_site_clean',
                uitype : 555,
                typeofdata : 'V~O',
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
                picklistvalues : ['Install Ready For inspection','Install incomplete (1 More Day)','Install incomplete (Weather)','Install Incomplete (needs Service)','Pending MPU Install','Pending Battery Install'],
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
        console.log('closeModal == ',localStorage.getItem(this.localInstallform))
        await this.modalController.dismiss({});
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
        var fieldlist = [];
        var fieldlistmassge = '';
        for (var i = 0; i < this.InstallfieldList.length; ++i) {
            if(this.InstallfieldList[i]["value"] != '' && this.InstallfieldList[i]["value"] != undefined){
                flag++;
            }else{
                fieldlist.push(this.InstallfieldList[i]["label"]);
                fieldlistmassge += 'This field is Required '+this.InstallfieldList[i]["label"] +'\n';
            }
        }
        if(flag == this.InstallfieldList.length){
            return true;
        }else{
            this.presentToast(
                fieldlistmassge
            );
            return false;
        }
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
                    localStorage.removeItem(this.localInstallform);
                    this.modalController.dismiss({});
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
    addUpdate(event, formate=null) {
        var fieldname = event.target.name;
        if (!fieldname || fieldname == "" || fieldname == undefined) {
          fieldname = event.target.id;
        }
        var fieldvalue = event.target.textContent + event.target.value;
        if (event.target.tagName == "ION-RADIO" || event.target.tagName == "ION-CHECKBOX")
        {
          fieldvalue = event.target.checked ? 1 : 0;
            fieldvalue = event.target.value;
        }
        if (event.target.tagName == "ION-DATETIME"
        ) {
            fieldvalue = event.target.value;
        }
        if (
          event.target.tagName == "ION-TEXTAREA" ||
          event.target.tagName == "ION-SELECT"
        ) {
          fieldvalue = event.target.value;
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
        for (var i = 0; i < this.InstallfieldList.length; ++i) {
            if(this.InstallfieldList[i].fieldname === fieldname){
                this.InstallfieldList[i]["value"] = '';
                this.InstallfieldList[i]["value"] = value;
            }
            if(this.InstallfieldList[i]["value"] != '' && this.InstallfieldList[i]["value"] != undefined){
                flag++;
            }
        }
        if(flag == this.InstallfieldList.length){
            this.btnsubmitInstallform = 1;
        }else{
            //this.btnsubmitInstallform = 0;
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
