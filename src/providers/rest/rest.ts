import { Injectable, Injector } from '@angular/core';
import { CoreWSProvider, CoreWSPreSets } from '@providers/ws';
/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

export interface BaseApiResponse{
  status: any;

}

export interface UserCourseProgress{
  completed: number,
  not_completed: number,
  total_enrollment: number
}
export interface UserSlidershowResponse {
  showslideshow:number,
  announcements:string,
  banner:UserBanner[],
  marketing_tiles:MarketingTiles[],
  my_courses:MyCourses[]
}
export interface UserBanner{
  title:string,
  content:string,
  image:string
}
export interface MarketingTiles{
  marketing:string,
  marketingimage:string,
  marketingcontent:string,
  marketingbuttontext:string,
  marketingbuttonurl:string,
  
}
export interface MyCourses{
  id:number,
  category:string,
  fullname:string,
  shortname:string,
  idnumber:string,
  image_url:string

}

export interface UserCourseProgressResponse extends BaseApiResponse {
  courses: UserCourseProgress;
}

@Injectable()
export class RestProvider {
  //  apiUrl = 'https://qa-moodle.vedific.com/webservice/rest/server.php';
  apiUrl = 'https://qa-moodle.vedific.com';
   postdata = {
    'wstoken': '6644a46edbb1f134eb119d8031512115',
    'wsfunction': 'local_vedificapi_get_user_courses_progress',
    'moodlewsrestformat': 'json',
    'user_id': '3'
  };
   wsPreSets: CoreWSPreSets = {
    wsToken: "6644a46edbb1f134eb119d8031512115",
    siteUrl: this.apiUrl,
  };
protected wsProvider: CoreWSProvider;

  constructor(injector: Injector) {
    this.wsProvider = injector.get(CoreWSProvider);
  }

  getCourses(): Promise<UserCourseProgressResponse> {
    return this.wsProvider.call("local_vedificapi_get_user_courses_progress", this.postdata,this.wsPreSets);
  }
  GetSliderData():Promise<UserSlidershowResponse>{
    return this.wsProvider.call("local_vedificapi_get_home_banner", this.postdata,this.wsPreSets);
  }
}
