import { Component, 
    OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import {ModalController, NavParams, ToastController, PickerController, NavController} from '@ionic/angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {ImageProvider} from '../../providers/image/image';
import {AppConstants} from '../../providers/constant/constant';
import {LoadingController} from '@ionic/angular';
import {ImageConfirmModalPage} from "../image-confirm-modal/image-confirm-modal.page";
import { fabric } from 'fabric';
import { Statement } from '@angular/compiler';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

@Component({
    selector: 'app-image-modal',
    templateUrl: './image-modal.page.html',
    styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {


    private _CANVAS : any;
    private _CONTEXT: any;

    private ctx: CanvasRenderingContext2D;
    private imgElm: HTMLImageElement;

    saveX: number;
    saveY: number;
    elemList: {};
    zoom: any;

    imageData: any;
    modalTitle: string;
    modelId: number;
    serviceid: any;
    columnname: string[];
    apiurl: any;
    user_id: any;
    dataReturned: any;
    index:any;
    is_delete:any;
    documentid:any;
    fileName:any;
    imagefrom:any;
    base64Image:string[];

    btnList = [
        { name:"circle", class:"radio-button-off" },
        { name:"square", class:"square-outline" },
        { name:"arrow", class:"arrow-forward" },
        { name:"brush", class:"brush" },
        { name:"search", class:"search-plus" },
        { name:"undo", class:"undo" },
        { name:"redo", class:"redo" },
        { name:"crop", class:"crop" },
        { name:"text", class:"text" },
        { name:"rotate", class:"sync" }
    ];
    photo = {
        title: '',
        primary_title: '',
        secondary_title: '',
        tower_section: '',
        serviceid: '',
        base64Image: '',
        columnname: ''
    };
    allTitlelist = {
        cf_photo_checklist_1: 'Front_House',
        cf_photo_checklist_2: 'Ext_Walls_Ele_Eav',
        cf_photo_checklist_3: 'Attic_Structural',
        cf_photo_checklist_4: 'MSP_D_Plate',
        cf_photo_checklist_5: 'MSP_Brkrs_DP',
        cf_photo_checklist_6: 'MSP_Cls',
        cf_photo_checklist_7: 'MSP_Stck',
        cf_photo_checklist_8: 'Sub_D_Cover',
        cf_photo_checklist_9: 'Surr_MSP',
        cf_photo_checklist_10: 'Cls_Elec_M_Number',
        cf_photo_checklist_11: 'Gas_Meter',
        cf_photo_checklist_12: 'Dig_A',
        cf_photo_checklist_13: 'Ovr_Feed',
        cf_photo_checklist_14: 'Ovr_Feed_Drp',
        cf_photo_checklist_15: 'Und_Utl_Wire',
        cf_photo_checklist_16: 'Roof_Plane',
        cf_photo_checklist_17: 'Dmg_Roof',
        cf_photo_checklist_18: 'Tile_Cond',
        cf_photo_checklist_19: 'Tile_Thk',
        cf_photo_checklist_20: 'Tilt_Mnt',
        cf_photo_checklist_21: 'Ext_Sol',
        cf_photo_checklist_22: 'Ext_Stckr_Inv',
        cf_photo_checklist_23: 'Pat_Cov',
        cf_photo_checklist_24: 'Gate_MS',
        cf_photo_checklist_25: 'Batt_Wall_Loc',
        cf_photo_checklist_26: 'Add_Rqst',
        cf_photo_checklist_27: 'Back_Door',
        cf_photo_checklist_28: 'MSP_Gnd',
    };
    elementSelected: any;
    touchTracker: any;
    showDrawTools: any;
    drawSelectedColor: any;

    protected state;
    protected mods;
    protected imgBackground;

    protected pausePanning;
    protected zoomStartScale;
    protected subSection;

    constructor(
        private modalController: ModalController,
        public modalCtrl: ModalController,
        private navParams: NavParams,
        public httpClient: HttpClient,
        private pickerCtrl: PickerController,
        private transfer: FileTransfer,
        private formBuilder: FormBuilder,
        public toastController: ToastController,
        public imgpov: ImageProvider,
        public appConst: AppConstants,
        public loadingController: LoadingController,
        public navCtrl: NavController,
        private alertController:AlertController,
        private platform: Platform
    ) {
        this.imageData = this.imgpov.getImage();
        this.apiurl = this.appConst.getApiUrl();
        this.zoom = false;
        this.state = [];
        this.mods = 0;
        this.touchTracker = {
            start: {},
            end: {}, 
            zoom: 1,
            canvasScale: 1,
            orginalImg: {
                width: 0,
                height: 0
            },
            reset: false
        };
        this.imgBackground = null;
        this.pausePanning = false;
        this.zoomStartScale = null;
    }

    @ViewChild('canvas',{static:false}) canvasEl: ElementRef;
    @ViewChild('img',{static:false}) img: ElementRef;
    ngOnInit() {
        //console.table(this.navParams);
        console.log('ngOnInit ========== appConst.workOrder ========== ',this.appConst.workOrder);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.columnname = this.navParams.data.columnname;
        this.modalTitle = this.navParams.data.paramTitle;
        this.photo.title = this.allTitlelist[this.navParams.data.columnname];
        this.user_id = this.navParams.data.user_id;
        this.index = this.navParams.data.columnIndex;
        this.is_delete = this.navParams.data.is_delete;
        this.documentid = this.navParams.data.documentid;
        this.subSection = this.navParams.data.subSection;
        this.imagefrom = this.navParams.data.imagefrom;
        this.showDrawTools = false;
        this.drawSelectedColor = 'black';
        console.log('columnname = ',this.columnname);
        console.log('index = ',this.index);
        console.log('subSection = ',this.subSection);
    }

    ngAfterViewInit() {
        this._CANVAS = new fabric.Canvas('canvas');

        this.imgElm = this.img.nativeElement;

        this.ctx = this._CANVAS.getContext('2d')
    }

    drawBtnSelect(btn) {
        if(this.elementSelected == "search") {
            this._CANVAS.setViewportTransform([1,0,0,1,0,0]); 
        }
        this.elementSelected = btn;
        if(this._CANVAS.isDrawingMode) this._CANVAS.isDrawingMode = false;
        console.log(this.elementSelected);

        if (this.elementSelected == 'brush' || this.elementSelected == 'circle' || this.elementSelected == 'arrow' || this.elementSelected == 'square'){
            this.showDrawTools = true;
        }else{
            this.showDrawTools = false;
        }

        switch(this.elementSelected) {
            case "brush":
                this._CANVAS.isDrawingMode = (this._CANVAS.isDrawingMode) ? false: true;
                if (this._CANVAS.isDrawingMode){
                    this._CANVAS.freeDrawingBrush.color = this.drawSelectedColor;
                    console.log('this.drawSelectedColor',this.drawSelectedColor)
                }
            break;
            case "undo":
                this.undoImg();
            break;
            case "redo":
                this.redoImg();
            break;
        }
    }

    rotateImage(ev) {
        let valRotate = ev.target.value;
        let curWidth = this._CANVAS.getWidth();
        let curHeight = this._CANVAS.getHeight();

        //console.log(valRotate);
        this._CANVAS.backgroundImage.rotate(valRotate);
        //console.log(this._CANVAS.toDataURL());
        if([90,180,270,360].includes(valRotate)) {
            this._CANVAS.setWidth(curHeight);
            this._CANVAS.setHeight(curWidth);
        }

        this._CANVAS.renderAll();
        this.updateModifications(true);
    }

    drawCircle() {
        let x = ((this.touchTracker.start.x - this.touchTracker.end.x) > 0) ? this.touchTracker.end.x : this.touchTracker.start.x;


        let y = ((this.touchTracker.start.y - this.touchTracker.end.y) > 0) ? this.touchTracker.end.y : this.touchTracker.start.y;

        this._CANVAS.add(
            new fabric.Circle({
                left:x,
                top:y,
                radius: Math.abs(this.touchTracker.start.x - this.touchTracker.end.x)/2,
                fill: 'transparent',
                strokeWidth: 4,
                stroke: this.drawSelectedColor
            })
        );
        
        this.updateModifications(true);
    }

    zoomImg() {

        console.log(this.touchTracker);
        if(this.touchTracker.zoom >= 10) {
            this.touchTracker.zoom -= 1;
            this.touchTracker.reset = true;
        } else if(this.touchTracker.zoom < 1) {
            this.touchTracker.zoom += 1;
            this.touchTracker.reset = false;
        }
        this.touchTracker.canvasScale =  this.touchTracker.zoom * 1.15;
        console.log(this.touchTracker);
        var canvasCenter = new fabric.Point(this.touchTracker.start.x, this.touchTracker.start.y);
        this._CANVAS.zoomToPoint(canvasCenter, this.touchTracker.canvasScale);
        this._CANVAS.renderAll();
        (!this.touchTracker.reset) ? this.touchTracker.zoom++ : this.touchTracker.zoom--;
        //this.updateModifications(true);
    }

    addText() {
        var text = this._CANVAS.add(new fabric.IText('Touch here to edit Text', {
            left: this.touchTracker.start.x,
            top: this.touchTracker.start.y,
            fill: 'white',
            fontFamily: 'Arial, Helvetica, sans-serif',
            stroke: 'black',
            fontWeight: 'bold',
            strokeWidth: 4,
            paintFirst: 'stroke',
            fontSize: 20
        }));

        var self = this;
        this._CANVAS.on("text:editing:entered", function (e) {
            if (e.target.type === "i-text") {
                if (e.target.text === "Touch here to edit Text") {
                    e.target.text = "";
                    e.target.hiddenTextarea.value = '';
                    self._CANVAS.renderAll();
                };
            }
        });

        this.updateModifications(true);
    }
    
    drawSquare() {
        let x = ((this.touchTracker.start.x - this.touchTracker.end.x) > 0) ? this.touchTracker.end.x : this.touchTracker.start.x;


        let y = ((this.touchTracker.start.y - this.touchTracker.end.y) > 0) ? this.touchTracker.end.y : this.touchTracker.start.y;

        this._CANVAS.add(
            new fabric.Rect({
                left:x,
                top:y,
                width: Math.abs(this.touchTracker.start.x - this.touchTracker.end.x),
                height: Math.abs(this.touchTracker.start.y - this.touchTracker.end.y),
                fill: 'transparent',
                strokeWidth: 4,
                stroke: this.drawSelectedColor
            })
        );
        this.updateModifications(true);
    }

    updateCanvas(event) {
        var elmurl = document.querySelector<HTMLInputElement>('.img-load');
        var imgWidth = elmurl.width;
        var imgHeight = elmurl.height;

        var cwidth = this.platform.width()*0.8;
        var cheight = this.platform.height()*0.6;
        let ratio = Math.min((cheight/imgHeight), (cwidth/imgWidth));
       
        this._CANVAS.setDimensions({width:imgWidth * ratio, height:imgHeight * ratio});


        fabric.Image.fromURL(this.imgElm.src, (img) => {
            this.imgBackground = img;
            this._CANVAS.setBackgroundImage(img, this._CANVAS.renderAll.bind(this._CANVAS),{
                scaleX: this._CANVAS.width / img.width,
                scaleY: this._CANVAS.height / img.height,
                crossOrigin: 'anonymous'
            });
            this.updateModifications(true);
        }, { crossOrigin: 'Anonymous' });
        this.touchTracker.orginalImg = {
            width: this._CANVAS.width,
            height: this._CANVAS.height
        };
        var elmurl = document.querySelector<HTMLInputElement>('.img-load')!;
        elmurl.style.display = "none";
        if(this.elementSelected == 'search') return;
        (function(elm) {
            elm._CANVAS.on({
                'object:modified': function() {
                    if(elm._CANVAS.isDrawingMode){
                        console.log('mod isDrawingMode');
                        elm.updateModifications(true);
                    }
                }, 'object:added': function() {
                    if(elm._CANVAS.isDrawingMode){
                        console.log('added isDrawingMode');
                        elm.updateModifications(true);
                    }
                }, 'mouse:down': function(ev) {
                    if(ev.target == null) {
                        elm.touchTracker.start = ev.pointer;
                        elm.touchTracker.end = ev.pointer;
                        if(elm.elementSelected == "text") {
                            elm.addText();
                            elm.elementSelected = "";
                        }
                    } else  elm.touchTracker = { start:null};
                },'mouse:up': function(ev) {
                    if(elm.touchTracker.start === null) return;
                    elm.touchTracker.end = ev.pointer;
                    switch(elm.elementSelected) {
                        case "circle":
                            elm.drawCircle();
                        break;
                        case "square":
                            elm.drawSquare();
                        break;
                        case "arrow":
                            elm.drawArrow();
                        break;
                        case "crop":
                            elm.cropImage();
                        break;
                        case "search":
                            elm.zoomImg();
                        break;
                    }
                }
            });
        })(this)
        this._CANVAS.counter = 0;
    }

    drawArrow() {
        var fromx = this.touchTracker.start.x;
        var fromy = this.touchTracker.start.y;
        var tox = this.touchTracker.end.x;
        var toy = this.touchTracker.end.y;
        var angle = Math.atan2(toy - fromy, tox - fromx);
        var headlen = 10;  // arrow head size

        tox = tox - (headlen) * Math.cos(angle);
        toy = toy - (headlen) * Math.sin(angle);
        var points = [
            {
                x: fromx,  // start point
                y: fromy
            }, {
                x: fromx - (headlen / 4) * Math.cos(angle - Math.PI / 2),
                y: fromy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            },{
                x: tox - (headlen / 4) * Math.cos(angle - Math.PI / 2),
                y: toy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            }, {
                x: tox - (headlen) * Math.cos(angle - Math.PI / 2),
                y: toy - (headlen) * Math.sin(angle - Math.PI / 2)
            },{
                x: tox + (headlen) * Math.cos(angle),  // tip
                y: toy + (headlen) * Math.sin(angle)
            }, {
                x: tox - (headlen) * Math.cos(angle + Math.PI / 2),
                y: toy - (headlen) * Math.sin(angle + Math.PI / 2)
            }, {
                x: tox - (headlen / 4) * Math.cos(angle + Math.PI / 2),
                y: toy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            }, {
                x: fromx - (headlen / 4) * Math.cos(angle + Math.PI / 2),
                y: fromy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            },{
                x: fromx,
                y: fromy
            }
        ];

        var pline = new fabric.Polyline(points, {
            fill: this.drawSelectedColor,
            stroke: 'black',
            opacity: 1,
            strokeWidth: 1,
            originX: 'left',
            originY: 'top',
            selectable: true
        });
        this._CANVAS.add(pline);
        this.updateModifications(true);
    }

    cropImage() {
        let x = ((this.touchTracker.start.x - this.touchTracker.end.x) > 0) ? this.touchTracker.end.x : this.touchTracker.start.x;


        let y = ((this.touchTracker.start.y - this.touchTracker.end.y) > 0) ? this.touchTracker.end.y : this.touchTracker.start.y;
        
        let width = Math.abs(this.touchTracker.start.x - this.touchTracker.end.x);
        let height = Math.abs(this.touchTracker.start.y - this.touchTracker.end.y);

        let tempImg = new Image();
        let tempCanvas = document.createElement('canvas');
        let tempctx = tempCanvas.getContext('2d');
        tempImg.src = this._CANVAS.toDataURL();
        tempCanvas.width = width;
        tempCanvas.height = height;
        (function(elm) {
            tempImg.onload = function() {
                tempctx.drawImage(tempImg, 
                    x,y,
                    width,
                    height,
                    0,0,
                    width,
                    height);

                let tempImg2 = new Image();
                tempImg2.src = tempCanvas.toDataURL();

                elm._CANVAS.clear();
                (function(elm){
                    tempImg2.onload = function() {
                        elm.imgBackground = elm._CANVAS.setBackgroundImage(tempImg2.src, elm._CANVAS.renderAll.bind(elm._CANVAS),{
                            scaleX: elm._CANVAS.width / width,
                            scaleY: elm._CANVAS.height / height,
                            crossOrigin: 'anonymous'
                        });
                    }
                })(elm);
            }
        })(this);
        this.updateModifications(true)
    }

    updateModifications(history) {
        this._CANVAS.counter ++;
        console.log("In updateModifications")
        if(history === true) {
            var _json = JSON.stringify(this._CANVAS);
            this.state.push(_json);
        }
    }

    undoImg() {
        if(this.mods < this.state.length) {
            console.log("undoImg",this.state.length, this.mods);
            let _index = this.state.length - 1 - this.mods - 1;
            if(_index < 0 ) return;
            this._CANVAS.clear().renderAll();
            this._CANVAS.loadFromJSON(this.state[_index]);
            this._CANVAS.renderAll();
            this.mods += 1;
        }
    }

    redoImg() {
        if (this.mods > 0) {
            console.log("redoImg",this.state.length, this.mods);
            this._CANVAS.clear().renderAll();
            this._CANVAS.loadFromJSON(this.state[this.state.length - 1 - this.mods + 1]);
            this._CANVAS.renderAll();
            this.mods -= 1;
        }
    }

    addColorUpdate(){
        if (this._CANVAS.isDrawingMode){
            this._CANVAS.freeDrawingBrush.color = this.drawSelectedColor;
            console.log('change this.drawSelectedColor',this.drawSelectedColor)
        }
    }

    async closeModal(data = 'Wrapped Up!') {
        const onClosedData: string = "Wrapped Up!";
        await this.modalController.dismiss(data);
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
            if (this.loading != undefined) {
                this.loading.dismiss();
            }
        }, 1000);
    }

    async confirmCancelImage(){
        const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Please Confirm!',
            message: 'Do you want to cancel any edits made to the image?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {}
                }, {
                    text: 'Yes',
                    handler: () => {
                        this.closeModal();
                    }
                }
            ]
        });

        await alert.present();
    }

    async confirmDeleteImage(photo){
        const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Please Confirm!',
            message: 'Are you sure you want to delete this image?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {}
                }, {
                    text: 'Yes',
                    handler: () => {
                        this.uploadImage(photo,true);
                    }
                }
            ]
        });

        await alert.present();
    }

    async uploadImage(data,delete_needed=false) {
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');

        await this.GetCanvasAtResoution();

        var imageData = this.imageData;

        if(delete_needed === true){
            var formDataD = {
                'serviceid':this.serviceid,
                'columnname':this.columnname,
                'is_delete':'true',
                'logged_in_user':this.user_id,
                'index':this.index,
                'documentid':this.documentid,
                'notecontent':data.title,
                'mode':'image_upload',
            };
        }else{
            if (this._CANVAS.toDataURL()) {
                var bs64img = this._CANVAS.toDataURL();
                var blob = this.dataURLtoBlob(bs64img);
            }

            var formData = new FormData();
            formData.append("blob", blob);
            formData.append("serviceid", this.serviceid);
            formData.append("columnname", this.columnname+'');
            formData.append("is_delete", 'false');
            formData.append("logged_in_user", this.user_id);
            formData.append("index", this.index);
            formData.append("documentid", this.documentid);
            formData.append("notecontent", data.title);
            formData.append("mode", 'image_upload');
            formData.append("imagefrom", this.imagefrom);
        }

        var postParam = (delete_needed === true) ? formDataD : formData;

        console.log('adding formData', postParam);

        this.showLoading();
        this.httpClient.post(this.apiurl + "postPhotos.php", postParam, {headers: headers, observe: 'response'})
            .subscribe(data => {
                this.hideLoading();
                //console.log(data['_body']);
                if (data['body']['success'] == true) {
                    if(this.columnname != undefined && this.columnname+'' !== ''){
                        if (delete_needed === true){
                            let imgLoc = this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'];
                            let position = -1;
                            for(var index = 0; index < imgLoc.length; index++) {
                                console.log(this.documentid);
                                (function(elm) {
                                    position = imgLoc[index].findIndex(function(obj, key) {
                                        return (obj.documentid === elm.documentid);
                                    });
    
                                    if(position > -1) {
                                        console.log(index, position);
                                        elm.appConst.workOrder[elm.serviceid][elm.columnname]['photos'][elm.index]['photos'][index].splice(position,1);
                                    }
                                })(this);
                            }
                            this.presentToastPrimary('Photo deleted successfully\n');
                            this.closeModal(data['body']['data']);
                        }else{
                            if(this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'][this.subSection] == undefined) {
                                    this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'][this.subSection] = [
                                        {
                                            imgpath:data['body']['data']['image_path'],
                                            documentid:data['body']['data']['image_id'],
                                            userid: this.user_id
                                        }
                                    ];
                            }
                            else {
                                this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'][this.subSection].push({
                                    imgpath:data['body']['data']['image_path'],
                                    documentid:data['body']['data']['image_id']
                                });
                            }
                            console.log(' ========== appConst.workOrder ========== ',this.appConst.workOrder);
                            this.presentToastPrimary('Photo saved successfully\n');
                            this.closeModal(data['body']['data']);
                        }
                    }else{
                        if (delete_needed === true){
                            if (data['body']['success'] == true){
                                console.log('Photo saved successfully');
                                this.presentToastPrimary('Photo saved successfully\n');
                                this.modalController.dismiss(
                                    {
                                        'is_delete':true,
                                        'documentid' : this.documentid
                                    }
                                );
                            }else{
                                console.log('Delete. failed');
                                this.presentToast('Delete failed! Please try again \n');
                            }
                        }else{
                            if (data['body']['success'] == true){
                                console.log('Photo saved successfully');
                                this.presentToastPrimary('Photo saved successfully\n');
                                this.modalController.dismiss(data['body']['data']);
                            }else{
                                console.log('upload failed');
                                this.presentToast('Upload failed! Please try again \n');
                            }
                        }
                        this.closeModal();
                    }
                }else {
                    if (this.is_delete === true){
                        console.log('Delete. failed');
                        this.presentToast('Delete failed! Please try again \n');
                    }else{
                        console.log('upload failed');
                        this.presentToast('Upload failed! Please try again \n');
                    }
                    this.closeModal();
                }
            }, error => {
                this.hideLoading();
                //console.log(error);
                //console.log(error.message);
                //console.error(error.message);
                this.presentToast("Upload failed! Please try again \n" + error.message);
                this.closeModal();
            });
    }

    dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    }

    GetCanvasAtResoution ()
    {
        var elmurl = document.querySelector<HTMLInputElement>('.img-load')!;

        if (this._CANVAS.width != elmurl.width) {
            var scaleX = elmurl.width / this._CANVAS.width;
            var scaleY = elmurl.height / this._CANVAS.height;

            var objects = this._CANVAS.getObjects();
            for (var i in objects) {
                objects[i].scaleX = objects[i].scaleX * scaleX;
                objects[i].scaleY = objects[i].scaleY * scaleY;
                objects[i].left = objects[i].left * scaleX;
                objects[i].top = objects[i].top * scaleY;
                objects[i].setCoords();
            }
            var obj = this._CANVAS.backgroundImage;
            if(obj){
                obj.scaleX = obj.scaleX * scaleX;
                obj.scaleY = obj.scaleY * scaleY;
            }

            this._CANVAS.discardActiveObject();
            this._CANVAS.setWidth(this._CANVAS.getWidth() * scaleX);
            this._CANVAS.setHeight(this._CANVAS.getHeight() * scaleY);
            this._CANVAS.renderAll();
            this._CANVAS.calcOffset();
        }
    }

    async openConfirmModal(serviceid,columnname) {
        const modal = await this.modalCtrl.create({
            component: ImageConfirmModalPage,
            componentProps: {
                "paramTitle": "Confirm",
                "serviceid": serviceid,
                "columnname": columnname,
                "user_id": this.user_id,
            }
        });

        modal.onDidDismiss().then((dataReturned) => {
            if (dataReturned !== null) {
                this.dataReturned = dataReturned.data;
                //alert('Modal Sent Data :'+ dataReturned);
            }
        });

        return await modal.present();
    }

    goToDetail(){
        
    }

    async presentToast(message: string) {
        var toast = await this.toastController.create({
            message: message,
            duration: 3500,
            position: "bottom",
            color: "danger"
        });
        toast.present();
    }

    async presentToastPrimary(message: string) {
        var toast = await this.toastController.create({
            message: message,
            duration: 2000,
            position: "bottom",
            color: "primary"
        });
        toast.present();
    }
}
