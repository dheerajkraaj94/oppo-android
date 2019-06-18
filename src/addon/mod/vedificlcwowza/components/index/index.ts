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
import { AddonModVedificlcwowzaProvider } from '../../providers/lecture';
import { CoreCourseModuleMainActivityComponent } from '@core/course/classes/main-activity-component';
import { Content, NavController, NavParams, LoadingController, Loading, Events } from 'ionic-angular';
import Player from '@vimeo/player';
import { Platform } from 'ionic-angular/platform/platform';
import { Subscription } from 'rxjs';
import { CoreSitesProvider } from '@providers/sites';
import { Network } from '@ionic-native/network';
import { WowzaSubscriber } from '@addon/mod/vedificlcwowza/providers/wowza-subscriber';
import { CoreAppProvider } from '@providers/app';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Insomnia } from '@ionic-native/insomnia';

/**
 * Component that displays an assignment.
 */
@Component({
    selector: 'addon-mod-vedificlcwowza-index',
    templateUrl: 'addon-mod-lecture-plugin.html'
})
@Injectable()
export class AddonModVedificlcwowzaIndexComponent extends CoreCourseModuleMainActivityComponent {
    component = 'mmaModvedificlcwowza';
    moduleName = 'vedificlcwowza';

    lecture: any; // The assign object.
    protected userId: number; // Current user ID.

    private player: Player;
    title: string = '';
    intro: string = '';
    referenceDocument: boolean = false;
    refDoucments: any;
    lectureLoaded = false;
    isPublish: any = 1;
    liveClassActive: boolean = false;
    joinTimer: any;
    private appResumeSubscription: Subscription;
    errorText: string = '';
    liveclassDiv = 'none';
    rejoinButton = 'none';
    isOnline: boolean = true;;
    room_id = '';
    roomStatus = '';
    publisher_id = '';
    reJoin = '';
    rejoinStatus = '';
    autoRejoinMsg = '';
    rejoinInterval: any;
    multipleJoinCase: any;
    publisher_status: any;
    loading:Loading;
    @ViewChild('player_container') playerContainer: ElementRef;
    userInfo:any;
    userName_u:any;
    userpictureurl:any;
    app_id:string = 'de5a24fafa95c8fbb3f4f5aa3ac282e2';
    constructor(private network: Network, navParams: NavParams, injector: Injector, sitesProvider: CoreSitesProvider, protected lectureProvider: AddonModVedificlcwowzaProvider, @Optional() content: Content, public platform: Platform
        , public wowzaService: WowzaSubscriber, protected appProvider: CoreAppProvider, private screenOrientation: ScreenOrientation, 
        private insomnia: Insomnia, public loadinCtrl : LoadingController, public events : Events
    ) {
        super(injector, content);
        const self = this;
        this.appResumeSubscription = platform.resume.subscribe(() => {

           // self.liveRoom();

        });
        this.appResumeSubscription = platform.pause.subscribe(() => {
            // handle multiple app minimize case
            clearInterval(this.rejoinInterval);
            clearInterval(this.multipleJoinCase);
           // self.wowzaService.closePlayer();
        });
        this.userId = navParams.get('userId') || sitesProvider.getCurrentSite().getUserId();
        this.userInfo = sitesProvider.getCurrentSite().getInfo();
        this.userName_u = this.userInfo.username;
        this.userpictureurl = this.userInfo.userpictureurl;

    }
    createLoading(){
        this.loading = this.loadinCtrl.create({content:'', duration: 8000});
        this.loading.present();
    }
    dismissLoading(){
        if(typeof this.loading == 'object')
        this.loading.dismiss();
    }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        this.lectureProvider.getAppVersion().then((data) => {
            this.wowzaService.init(data);
            this.loadContent(false, false).finally(() => {
                console.log('finally');
                this.lectureProvider.invalidateUserLecture(this.courseId);
            });
        });
    }

    /**
   * Get assignment data.
   *
   * @param {boolean} [refresh=false] If it's refreshing content.
   * @param {boolean} [sync=false] If the refresh is needs syncing.
   * @param {boolean} [showErrors=false] If show errors to the user of hide them.
   * @return {Promise<any>} Promise resolved when done.
   */
    protected fetchContent(refresh: boolean = false, sync: boolean = false, showErrors: boolean = false): Promise<any> {
        console.log('getLecture');
        let onlineStatus = this.appProvider.isOnline();
        return this.lectureProvider.getLecture(this.courseId, this.module.id).then((lectureData) => {
            console.log('lectureData ' + JSON.stringify(lectureData));
            this.errorText = '';
            this.liveclassDiv = 'none';
            this.room_id = '';
            this.publisher_id = '';
            this.app_id = lectureData[0].app_id;
            
            if (lectureData[0].go_live && lectureData[0].closed_at == null && lectureData[0].closed_at == null) {
                this.liveclassDiv = 'block';
                (<HTMLElement>document.querySelector('.show-tabbar')).style.display = 'none';
                this.room_id = lectureData[0].room_hash;
                this.publisher_id = lectureData[0].user_id;
                this.autoRejoinMsg = 'Connecting Please wait...';
                this.wowzaService.handleStreamStatus('no_error', false);
                
        if (onlineStatus) {
            console.log('onlineStatus '+ onlineStatus);
                this.liveRoom();
        }else{
            console.log('onlineStatus '+ onlineStatus);
            this.errorText = 'No Internet.';
        }
                this.intro = lectureData[0].intro;
                // this.platform.registerBackButtonAction(() => {
                //     //this.platform.exitApp();
                //     console.log('back button is diabled in liveclass.');
                // });
            } else if (!lectureData[0].is_file_processed && !lectureData[0].isPublish && lectureData[0].closed_at) {
                this.wowzaService.disconnectSocket();
                this.errorText = 'Lecture video is under review.'
                console.log('Lecture video is under review.');
            } else if (!lectureData[0].is_file_processed && lectureData[0].isPublish && lectureData[0].closed_at) {
                this.wowzaService.disconnectSocket();
                this.errorText = 'Lecture video is under processed.';
                console.log('Lecture video is under processed.');
            } else if (lectureData[0].is_file_processed && !lectureData[0].isPublish && lectureData[0].closed_at) {
                this.wowzaService.disconnectSocket();
                this.errorText = 'Lecture is not published.'
                console.log('Lecture not published.');
            } else if (lectureData[0].is_file_processed && lectureData[0].isPublish && lectureData[0].path && lectureData[0].closed_at) {
                this.wowzaService.disconnectSocket();
                this.liveclassDiv = 'none';
                this.showLectureVideo(lectureData);
                this.showReferenceDocument();
            } else {
                this.wowzaService.disconnectSocket();
                this.errorText = 'Lecture is not published.';
                console.log('Under review.');
            }
            this.lecture = lectureData;
            this.dataRetrieved.emit(this.lecture);
        }).then(() => {
            console.log('Then');
        });
    }

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
    wasOffline = 0;
    liveRoom() {
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
                        //this.wowzaService.reInitSocket(this.room_id, this.userId, this.userName_u, this.userpictureurl, this.app_id);
                        this.wasOffline = 0;
                    }
                    this.autoRejoinMsg = '';
                    this.reJoin = '';
                    this.roomStatus = 'Rejoin';     
                });

        let onlineStatus = this.appProvider.isOnline();
        if (onlineStatus) {
            //   if (this.previousClick == '') {
            this.previousClick = 1;

            this.rejoinStatus = 'Connecting!! Please wait...';
            this.reJoin = 'rejoin';
            console.log('connectSocket ');
            this.wowzaService.connectSocket(this.room_id, this.userId, this.userName_u, this.userpictureurl, this.app_id, 0).then(data => {
console.log('connectSocket '+data.eventId);
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
                console.log(' Json data 2 =>' + stream_status);
                this.wowzaService.handleStreamStatus(stream_status, isMuted);
            }

            });
            //   }
        }

    }
    connect(room_id, user_id, userName, userImage) {
        this.wowzaService.getRoom().subscribe(d => {
            this.roomData = d;
            let room_stream_status: string = this.roomData.status;
            let isRoomMuted: boolean = this.roomData.muted;
            this.roomStatus = room_stream_status;
            console.log(' Json data 2 =>' + room_stream_status);

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
            }else if (this.publisher_status.status == false) {
                this.autoRejoinMsg = '';
                this.reJoin = '';
                this.rejoinStatus = '';
                this.roomStatus = 'Rejoin';
              }
        });
    }
    rejoin() {

        this.rejoinButton = 'none';

        // this.liveclassProvider.handleOfflineState();


    }
    showLectureVideo(record: any) {
        this.liveClassActive = false;
        if (record[0].isPublish) {
            this.isPublish = 1;
            this.player = new Player(this.playerContainer.nativeElement, {
                url: record[0].path
            });
            this.title = record[0].name;
            this.intro = record[0].intro;
            this.player.on('play', function () {
            });
            this.player.getVideoTitle().then(function (title) {
            });
        } else {
            this.isPublish = 0;
        }
    }
    showReferenceDocument() {
        this.lectureProvider.getReferenceDocument(this.courseId, this.module.id).then((documentData) => {
            this.referenceDocument = documentData.status;
            this.refDoucments = documentData.records;
        }).then(() => {
        });
    }

    /** 
     * Refresh the lecture.
     *
     * @param {any} refresher Refresher.
     */
    refreshLecture(refresher: any): void {
        this.lectureProvider.invalidateUserLecture(this.courseId).finally(() => {

        });
    }
    ionViewWillLeave(){
        this.wowzaService.forcedisconnectSocket();
        this.wowzaService.destroyPlayerInstance();
      }
    ngOnDestroy() {this.dismissLoading();
        
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


}
