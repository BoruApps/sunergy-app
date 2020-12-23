import { Injectable } from '@angular/core';

@Injectable()
export class AppConstants  {
    apiurl : string = 'http://vtiger.local/sunergy/phoneapi/';
    vturl : string = 'http://vtiger.local/sunergy/';
    getApiUrl() {
        return this.apiurl;
    }
    getVtUrl() {
        return this.vturl;
    }
}
