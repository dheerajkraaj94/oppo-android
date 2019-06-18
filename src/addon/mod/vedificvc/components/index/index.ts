// (C) Copyright 2015 Martin Dougiamas (sahil)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import { Component, Optional, ElementRef, Injector, ViewChild, Injectable } from '@angular/core';
import { AddonModVedificVCProvider } from '../../providers/lecture';
import { CoreCourseModuleMainActivityComponent } from '@core/course/classes/main-activity-component';
import { Content, NavParams, Loading, LoadingController, Events } from 'ionic-angular';
import Player from '@vimeo/player';
import { Platform } from 'ionic-angular/platform/platform';
import { Subscription } from 'rxjs';
import { CoreSitesProvider } from '@providers/sites';
import { Network } from '@ionic-native/network';
import { AddonModUrlHelperProvider } from '@addon/mod/url/providers/helper';
//import { AddonModLiveClassProvider } from '@addon/mod/vedificvc/providers/liveclass';
import { WowzaSubscriber } from '@addon/mod/vedificlcwowza/providers/wowza-subscriber';
import { CoreAppProvider } from '@providers/app';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Insomnia } from '@ionic-native/insomnia';


/**
 * Component that displays an assignment.
 */
@Component({
    selector: 'addon-mod-vedificvc-index',
    templateUrl: 'addon-mod-vc-plugin.html'
})
@Injectable()
export class AddonModVedificVCIndexComponent extends CoreCourseModuleMainActivityComponent {

    component = 'mmaModVedificvc';
    moduleName = 'vedificvc';

    lecture: any; // The assign object.
    protected userId: number; // Current user ID.

    private player: Player;
    title: string = '';
    intro: string = '';
    referenceDocument: boolean = false;
    refDoucments: any;
    lectureLoaded = false;
    video_currenttime: number = 0;
    private appResumeSubscription: Subscription;
    vimeoVideoSeekTime: number = 5000;
    vimeoVideoObserver: any = '';
    errorText: string = '';
    @ViewChild('player_container') playerContainer: ElementRef;
    rejoinInterval: any;
    room_id = '';
    userInfo: any;
    userName_u: any = '';
    userpictureurl: any = '';
    app_id:string = '3cf381b259de9da72e8aff7054143bc6';
    constructor(
        private network: Network,
        navParams: NavParams,
        injector: Injector,
        sitesProvider: CoreSitesProvider,
        protected vcProvider: AddonModVedificVCProvider,
        @Optional() content: Content, private urlHelper: AddonModUrlHelperProvider,
        public platform: Platform,
         public wowzaService: WowzaSubscriber, protected appProvider: CoreAppProvider, private screenOrientation: ScreenOrientation,
        private insomnia: Insomnia, public loadinCtrl: LoadingController, public events : Events
    ) {
        super(injector, content);
        // this.userId = this.sitesProvider.getCurrentSiteUserId();
        this.userId = navParams.get('userId') || sitesProvider.getCurrentSite().getUserId();
        this.userInfo = sitesProvider.getCurrentSite().getInfo();
        this.userName_u = this.userInfo.username;
        this.userpictureurl = this.userInfo.userpictureurl;

        console.log('this.userInfo ' + this.userInfo + ' json ' + JSON.stringify(this.userInfo));
        this.appResumeSubscription = this.platform.pause.subscribe(() => {
            setTimeout(() => {

                if (typeof this.player == 'object') {
                    this.player.pause();
                }
            }, 1500);
        });
        this.appResumeSubscription = platform.resume.subscribe(() => {
            // do something meaningful when the app is put in the foreground
            if (typeof this.player == 'object') {
                this.player.play();
            }
        });
    }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        (<HTMLElement>document.querySelector('.show-tabbar')).style.display = 'none';

        this.vcProvider.getAppVersion().then((data) => {
            this.wowzaService.init(data);
        });

        this.loadContent(false, false).finally(() => {
            this.vcProvider.invalidateUserCache(this.courseId);
        });
    }

    /**
   * Get data.
   *
   * @param {boolean} [refresh=false] If it's refreshing content.
   * @param {boolean} [sync=false] If the refresh is needs syncing.
   * @param {boolean} [showErrors=false] If show errors to the user of hide them.
   * @return {Promise<any>} Promise resolved when done.
   */
    liveclassDiv: any = 'none';
    publisher_id: any;
    wasOffline: any = 0;
    protected fetchContent(refresh: boolean = false, sync: boolean = false, showErrors: boolean = false): Promise<any> {

        return this.vcProvider.getVC(this.courseId, this.module.id, '', this.userId).then((lectureData) => {
            console.log('lectureData ' + JSON.stringify(lectureData));
            this.errorText = '';
            this.liveclassDiv = 'none';
            this.room_id = '';
            this.publisher_id = '';
           

            this.room_id = lectureData.class_detail.room_id;
            this.publisher_id = lectureData.class_detail.user_id;
            this.wowzaService.handleStreamStatus('no_error', false);
            this.app_id = lectureData.class_detail.app_id;

            let onlineStatus = this.appProvider.isOnline();
            if(onlineStatus){
            this.wowzaService.connectSocket(lectureData.class_detail.room_id, this.userId, this.userName_u, this.userpictureurl, this.app_id, 1).then(data => {
                
                    if(data.eventId == 'duplicate'){
                        this.wowzaService.disconnectSocket();
                        this.rejoinStatus = 'duplicate';
                        this.reJoin = 'duplicate';
                        this.autoRejoinMsg = '';
                        this.errorText = 'Seems you have already joined the live class from another device. You have to abort the previous session to watch here.';
                        
                    }else{

                let stream_status: string = data.room.status;
                if (stream_status != 'stopped' && data.room.live_at != false) {
                    this.intro = lectureData.class_detail.intro;
                    this.liveclassDiv = 'block';
                    this.joinRoom(stream_status);
                }else{
                    this.liveclassDiv = 'none';
                    if (lectureData.class_detail.closed_at != null && lectureData.class_detail.is_auto_published == 1) {
                        this.wowzaService.disconnectSocket();
                        this.classDetail(lectureData.class_detail);
                        this.showLectureVideo(lectureData.file, lectureData.video_percent.percent);

                        this.activiyCompletion(this.courseId, this.module.id, this.userId);
                    } else if (lectureData.class_detail.closed_at != null && lectureData.class_detail.is_auto_published == 0) {
                        this.wowzaService.disconnectSocket();
                        this.errorText = 'Lecture is not published yet';
                    } else if (lectureData.class_detail.closed_at == null) {
                        this.wowzaService.disconnectSocket();
                        this.errorText = 'Lecture is not publish yet.';
                    } else {
                        this.wowzaService.disconnectSocket();
                        this.errorText = 'No details found';
                    }

                } 
            }
            });
        }else{
            this.rejoinStatus = 'no_connection';
             this.reJoin = 'no_connection';
           this.errorText = 'No Internet.';
        }
            // || lectureData.class_detail.is_auto_published == 0
            this.dataRetrieved.emit(lectureData);
        }).then(() => {
            console.log('Then');
        });
    }

    classDetail(record: any) {
        console.log('record ' + record);
        this.title = record.name;
        this.intro = record.intro;
    }

    showLectureVideo(record: any, seekTime: any) {
        let path = '';
        let self = this;
        if (record.length == 1) {
            path = record[0].publish_url;
            this.referenceDocument = false;
        } else
            if (record.length > 1) {
                let last: any = record[record.length - 1];
                path = last.publish_url;

                let doc = record.slice(0, record.length - 1);
                // show reference doc
                this.showRefDoucments(doc);
            }

        if (path.indexOf("vimeo") > -1) {
            let noerror = 1;
            try {
                this.player = new Player(this.playerContainer.nativeElement, {
                    url: path
                })
            } catch (error) {
                console.error(error);
                console.log('incatch ');
                noerror = 0;
                this.errorText = 'This video will be available for viewing shortly.';
            }

            this.player.ready().then(function () {

            }).catch(function (e) {
                console.log('e ' + e);
                self.errorText = 'This video will be available for viewing shortly.';
            });
            if (noerror) {
                const seekTimePercent = seekTime;
                this.player.getDuration().then(function (duration) {
                    seekTime = parseFloat(((seekTime / 100) * duration).toFixed(4));
                    self.player.setCurrentTime(seekTime).then(function (seconds) {
                        console.log('seconds ' + seconds);
                    });
                });

                this.player.on('play', function () {
                    clearInterval(self.vimeoVideoObserver);
                    self.seekVideoTime(seekTimePercent);
                    console.log('seekVideoTime ');
                });
                this.player.on('end', function () {
                    //  clearInterval(self.vimeoVideoObserver);
                    self.seekVideoTime(10);
                    console.log('seekVideoTime end ');
                });
                this.player.on('pause', function () {
                    // the video was paused
                    //clearInterval(self.vimeoVideoObserver);
                    console.log('paused ');
                });
            }
        } else {
            this.errorText = 'No video found';
        }

    }
    seekVideoTime(seekTime) {
        console.log('video seeked');
        //  if (seekTime != 100) {
        let percent: number = 0;
        let self = this;
        this.vimeoVideoObserver = setInterval(function () {

            self.player.getDuration().then(function (duration) {
                // duration = the duration of the video in seconds
                self.player.getCurrentTime().then(function (seconds) {
                    percent = ((seconds / duration) * 100) * 1;
                    percent = parseFloat(percent.toFixed(4));
                    // seek request here
                    self.vcProvider.seekVideoTime(percent, self.module.id, self.userId);
                });
            });

        }, 3000);
        //}
    }
    activiyCompletion(courseId, id, userId) {
        return this.vcProvider.getVCac(courseId, id, '', userId).then(() => {
            this.vcProvider.invalidateUserCache(this.courseId);
        });
    }

    showRefDoucments(refDoc: any) {
        this.referenceDocument = true;
        this.vcProvider.invalidateUserCache(this.courseId);
        let self = this;
        let refDoucment = [];
        for (let doc of refDoc) {
            if (doc.path != null) {
                const path = doc.publish_url;
                if (path != null && path.indexOf("youtube") > -1) {
                    console.log('youtube');
                    let form = { 'fileurl': doc.publish_url, 'filename': doc.title, 'isyoutube': 1 };
                    refDoucment.push(form);
                } else {
                    this.vcProvider.getDownloadableDoc(doc.path, '', self.courseId).then((res) => {
                        const filename = doc.title; console.log('filename');
                        const dot = filename.lastIndexOf('.');
                        let ext1 = '';
                        if (dot > -1) {
                            ext1 = filename.substr(dot + 1).toLowerCase();
                            if (!ext1) {
                                ext1 = filename + '.' + doc.ext;
                            } else {
                                ext1 = filename;
                            }
                        } else {
                            ext1 = filename + '.' + doc.ext;
                        }
                        const ext = ext1;//filename + '.' + doc.ext;
                        let form = { 'fileurl': res.fileurl, 'filename': ext, 'isexternalfile': true, 'isyoutube': 0, 'filesize': '74638' };
                        refDoucment.push(form);
                    });

                }
            }
        } console.log('refDoucment ' + refDoucment);
        this.refDoucments = refDoucment;
    }

    /** 
     * Refresh the lecture.
     *
     * @param {any} refresher Refresher.
     */
    refreshLecture(refresher: any): void {
        this.vcProvider.invalidateUserCache(this.courseId).finally(() => {

        });
    }
    go(url: any) {
        this.urlHelper.open(url);
    }
    ngOnDestroy() {
        (<HTMLElement>document.querySelector('.show-tabbar')).style.display = '';
        this.appResumeSubscription && this.appResumeSubscription.unsubscribe();
        clearInterval(this.vimeoVideoObserver);
        console.log('On Destroy');

        this.dismissLoading();
        this.wowzaService.disconnectSocket();
        console.log('this.liveClassActive ' + this.liveClassActive);
        if (this.liveClassActive) {
            //   this.liveclassProvider.removeStream();
            //   this.liveclassProvider.forceToCloseTimer();
            (<HTMLElement>document.querySelector('.show-tabbar')).style.display = '';
        }
        this.liveClassActive = false;
        this.appResumeSubscription && this.appResumeSubscription.unsubscribe();
        console.log('On Destroy');



        // this.wowzaService.unlockScreen();
        this.insomnia.allowSleepAgain()
            .then(
                () => console.log('success'),
                () => console.log('error')
            );

        /// this.wowzaService.closePlayer();
        this.wowzaService.clearIntervals();
        // handle multiple app minimize case
        clearInterval(this.rejoinInterval);
        clearInterval(this.multipleJoinCase);
        this.events.unsubscribe('network:offline');
        this.events.unsubscribe('network:online');
    }
    autoRejoinMsg: any;
    rejoinStatus: any;
    reJoin: any = '';
    multipleJoinCase: any;
    roomStatus: any;
    rejoinButton: any;
    liveClassActive: any;
    reJoinRoom() {

        this.wowzaService.handleStreamStatus('no_error', false);
        this.wowzaService.forcedisconnectSocket();
        this.wowzaService.destroyPlayerInstance();
        this.autoRejoinMsg = '';
        this.rejoinStatus = 'Connecting!! Please Wait...';
        this.reJoin = 'rejoin';

        // handle multiple app minimize case
        clearInterval(this.rejoinInterval);
        clearInterval(this.multipleJoinCase);

        this.multipleJoinCase = setTimeout(() => {
            this.liveRoom();
        }, 1000);


        this.rejoinInterval = setTimeout(() => {
            this.autoRejoinMsg = '';
            this.roomStatus = 'Rejoin';
            this.reJoin = '';
        }, 12000);

    }
    roomData: any;
    isUserOnline: any;
    socketStatus: any;
    previousClick: any = '';

    liveRoom() {
        this.rejoinButton = 'block';
        this.autoRejoinMsg = '';
        this.liveClassActive = true;
        let onlineStatus = this.appProvider.isOnline();
        if (onlineStatus) {
            //   if (this.previousClick == '') {
            this.previousClick = 1;

            this.rejoinStatus = 'Connecting!! Please wait...';
            this.reJoin = 'rejoin';

            this.wowzaService.connectSocket(this.room_id, this.userId, this.userName_u, this.userpictureurl, this.app_id, 1).then(data => {
                setTimeout(() => {
                    this.previousClick = '';
                }, 3000);
                if(data.eventId == 'duplicate'){
                    this.wowzaService.disconnectSocket();
                    this.rejoinStatus = 'duplicate';
                    this.reJoin = 'duplicate';
                    this.autoRejoinMsg = '';
                    this.errorText = 'Seems you have already joined the live class from another device. You have to abort the previous session to watch here.';
                    
                }else{
                let stream_status: string = data.room.status;
                let isMuted: boolean = data.room.muted;
                switch (stream_status) {
                    case 'playing':
                        this.createLoading();
                        this.autoRejoinMsg = '';
                        setTimeout(() => {
                            this.autoRejoinMsg = '';
                            this.roomStatus = 'Rejoin';
                            this.reJoin = '';
                            this.connect(this.room_id, this.userId, this.userName_u, this.userpictureurl);
                            this.dismissLoading();
                        }, 8000);
                        break;
                    case 'paused':
                        this.autoRejoinMsg = 'This class has been paused by teacher.';
                        this.rejoinStatus = '';
                        this.reJoin = 'paused';
                        break; 
                    case 'stopped':
                        this.autoRejoinMsg = 'This class has been closed by teacher.';
                        this.reJoin = 'stopped';
                        this.roomStatus = '';
                        setTimeout(() => {
                            this.autoRejoinMsg = 'This class has been closed by teacher.';
                        this.reJoin = 'stopped';
                        this.roomStatus = '';
                        }, 3000);
                        break;
                    default:
                        this.reJoin = '';
                        this.roomStatus = 'Rejoin';
                        this.autoRejoinMsg = '';
                        break;
                }
                console.log(' Json data 1 =>' + stream_status);
                this.wowzaService.handleStreamStatus(stream_status, isMuted);
            }

            });
            //   }
        }

    }

    joinRoom(stream_status) {
        this.rejoinButton = 'block';
        this.autoRejoinMsg = '';
        this.liveClassActive = true;

        this.wowzaService.initializeNetworkEvents();

        // Offline event
                this.events.subscribe('network:offline', () => {
                    console.log('network:offline ==> '+this.network.type);  
                    // handle multiple app minimize case
        clearInterval(this.rejoinInterval);
        clearInterval(this.multipleJoinCase);
                    this.liveclassDiv = 'block';
                this.wasOffline = 1;
                this.autoRejoinMsg = 'No Internet.';
                this.reJoin = 'no_connection';
                this.roomStatus = '';
                this.wowzaService.handleStreamStatus('no_connection', false);
                });

                // Online event
                this.events.subscribe('network:online', () => {
                    console.log('network:online ==> '+this.network.type);   
                    if (this.wasOffline == 1) {
                        console.log('reInitSocket');
                        clearInterval(this.rejoinInterval);
                        clearInterval(this.multipleJoinCase);
                        //this.wowzaService.reInitSocket(this.room_id, this.userId, this.userName_u, this.userpictureurl, this.app_id);
                        this.wasOffline = 0;
                    }
                    this.autoRejoinMsg = '';
                    this.reJoin = '';
                    this.roomStatus = 'Rejoin';     
                });
        let onlineStatus = this.appProvider.isOnline();
        if (onlineStatus) {
            this.rejoinStatus = 'Connecting!! Please wait...';
            this.reJoin = 'rejoin';


            switch (stream_status) {
                case 'playing':
                    this.createLoading();
                    this.autoRejoinMsg = '';
                    setTimeout(() => {
                        this.autoRejoinMsg = '';
                        this.roomStatus = 'Rejoin';
                        this.reJoin = '';
                        this.connect(this.room_id, this.userId, this.userName_u, this.userpictureurl);
                        this.dismissLoading();
                    }, 8000);
                    break;
                case 'paused':
                    this.autoRejoinMsg = 'This class has been paused by teacher.';
                    this.rejoinStatus = '';
                    this.reJoin = 'paused';
                    break;
                case 'stopped':
                    this.autoRejoinMsg = 'This class has been closed by teacher.';
                    this.reJoin = 'stopped';
                    this.roomStatus = '';
                    setTimeout(() => {
                        this.autoRejoinMsg = 'This class has been closed by teacher.';
                    this.reJoin = 'stopped';
                    this.roomStatus = '';
                    }, 3000);
                    break;
                default:
                    this.reJoin = '';
                    this.roomStatus = 'Rejoin';
                    this.autoRejoinMsg = '';
                    break;
            }
            console.log(' Json data 2 =>' + stream_status);
            this.wowzaService.handleStreamStatus(stream_status, false);

        }

    }
    publisher_status: any;
    loading: Loading;
    connect(room_id, user_id, userName, userImage) {
        this.wowzaService.getRoom().subscribe(d => {
            this.roomData = d;
            let room_stream_status: string = this.roomData.status;
            let isRoomMuted: boolean = this.roomData.muted;
            this.roomStatus = room_stream_status;
            console.log(' Json data 3 =>' + room_stream_status);

            switch (room_stream_status) {
                case 'playing':
                    this.autoRejoinMsg = '';
                    this.rejoinStatus = 'Connecting!! Please wait...';
                    this.reJoin = 'rejoin';
                    this.createLoading();
                    setTimeout(() => {
                        this.autoRejoinMsg = '';
                        this.roomStatus = 'Rejoin';
                        this.reJoin = '';
                        this.dismissLoading();
                    }, 8000);
                    break;
                case 'paused':
                    this.autoRejoinMsg = 'This class has been paused by teacher.';
                    this.rejoinStatus = '';
                    this.reJoin = 'paused';
                    break;
                case 'stopped':
                    this.autoRejoinMsg = 'This class has been closed by teacher.';
                    this.reJoin = 'stopped';
                    this.roomStatus = '';
                    setTimeout(() => {
                        this.autoRejoinMsg = 'This class has been closed by teacher.';
                    this.reJoin = 'stopped';
                    this.roomStatus = '';
                    }, 3000);
                    break;
                default:
                    this.reJoin = '';
                    this.roomStatus = 'Rejoin';
                    this.autoRejoinMsg = 'Unable to Connect!!Please try again';
                    break;
            }
            this.wowzaService.handleStreamStatus(room_stream_status, isRoomMuted);
        });
        this.wowzaService.getUser(this.publisher_id).subscribe(d => {

            this.publisher_status = d;
            if (this.publisher_status.status == true) {
                this.autoRejoinMsg = 'Teacher is offline.';
                this.reJoin = '1';
                this.rejoinStatus = '';
                this.roomStatus = 'Rejoin';

                // handle multiple app minimize case
                clearInterval(this.rejoinInterval);
                clearInterval(this.multipleJoinCase);
            } else if (this.publisher_status.status == false) {
                this.autoRejoinMsg = '';
                this.reJoin = '';
                this.rejoinStatus = '';
                this.roomStatus = 'Rejoin';
            }
        });
    }
    createLoading() {
        this.loading = this.loadinCtrl.create({ content: '',duration: 8000 });
        this.loading.present();
    }
    dismissLoading() {
        if (typeof this.loading == 'object')
            this.loading.dismiss();
    }
    ionViewWillLeave() {
        this.wowzaService.forcedisconnectSocket();
    }

}
