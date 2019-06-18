// (C) Copyright 2015 Martin Dougiamas
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

import { Injectable } from '@angular/core';
import { CoreAppProvider } from '@providers/app';
import { CoreFilepoolProvider } from '@providers/filepool';
import { CoreLoggerProvider } from '@providers/logger';
import { CoreSitesProvider } from '@providers/sites';
import { CoreTextUtilsProvider } from '@providers/utils/text';
import { CoreTimeUtilsProvider } from '@providers/utils/time';
import { CoreUtilsProvider } from '@providers/utils/utils';
import { CoreCommentsProvider } from '@core/comments/providers/comments';
import { CoreUserProvider } from '@core/user/providers/user';
import { CoreGradesProvider } from '@core/grades/providers/grades';
import { CoreConfigConstants } from '../../../../configconstants';
//import { CoreSiteWSPreSets } from '@classes/site';


/**
 * Service that provides some functions for assign.
 */
@Injectable()
export class AddonModVedificVCProvider {
    protected ROOT_CACHE_KEY = 'mmaModVedific:';

    protected logger;
    protected gradingOfflineEnabled: { [siteId: string]: boolean } = {};

    constructor(logger: CoreLoggerProvider, private sitesProvider: CoreSitesProvider, private textUtils: CoreTextUtilsProvider,
        private timeUtils: CoreTimeUtilsProvider, private appProvider: CoreAppProvider, private utils: CoreUtilsProvider,
        private userProvider: CoreUserProvider,
        private gradesProvider: CoreGradesProvider, private filepoolProvider: CoreFilepoolProvider,
        private commentsProvider: CoreCommentsProvider) {
        this.logger = logger.getInstance('AddonModVedificVCProvider');
    }
    /**
            * Check if assignments plugin is enabled in a certain site.
            *
            * @param {string} [siteId] Site ID. If not defined, current site.
            * @return {boolean} Whether the plugin is enabled.
            */
    isPluginEnabled(siteId?: string): boolean {
        return true;
    }
    /**
     * Get an assignment by course module ID.
     *
     * @param {number} courseId Course ID the assignment belongs to.
     * @param {number} cmId Assignment module ID.
     * @param {string} [siteId] Site ID. If not defined, current site.
     * @return {Promise<any>} Promise resolved with the assignment.
     */
    getVC(courseId: number, cmid: number, siteId?: string, userid?:any): Promise<any> {
        return this.getVCByField(courseId, 'cmid', cmid, siteId, userid);
    }

    getAppVersion(): Promise<any> {
        return this.sitesProvider.getSite().then((site) => {
            const params = {
            },
                preSets = {
                    cacheKey: this.getVCCacheKey(123123)
                };

            return site.read('mod_vedificvc_get_settings', params, preSets).then((response) => {
                this.invalidateUserCache(123123);
                // Search the Lecture video to return.
                if (response) {
                    return response;
                }
                return Promise.reject(null);
            });
        });
    }
    forceToExitApp(response: any) {
        if (response.app_management_settings != undefined) {
        
            if ( response.app_management_settings.android_version > CoreConfigConstants.versioncode && response.app_management_settings.force_upgrade) {
                return true;
            }else{
                return false;
            }
        } else{
            return false;
        }
       
    }
    getAppURL(data:any){
        let playstoreUrl:string = 'https://play.google.com/store/apps/details?id=com.vedific.sslacademy';
        return (data.app_management_settings.android_app_url!='')?data.app_management_settings.android_app_url: playstoreUrl;
    }

    /**
     * Get an assigment with key=value. If more than one is found, only the first will be returned.
     *
     * @param {number} courseId Course ID.
     * @param {string} key Name of the property to check.
     * @param {any} value Value to search.
     * @param {string} [siteId] Site ID. If not defined, current site.
     * @return {Promise<any>} Promise resolved when the assignment is retrieved.
     */
    protected getVCByField(courseId: number, key: string, value: any, siteId?: string,userid?: any): Promise<any> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const params = {
                //  courseids: [courseId]
                context_id: value,
                user_id:userid
            }, 
                preSets = {
                    cacheKey: this.getVCCacheKey(courseId)
                };

            return site.read('mod_vedificvc_get_vc_detail', params, preSets).then((response) => {
                // Search the Lecture video to return.
                if (response) {
                    return response;
                }
                console.log(response);

                return Promise.reject(null);
            });
        });
    }


    /**
     * Get an assignment by course module ID.
     *
     * @param {number} courseId Course ID the assignment belongs to.
     * @param {number} cmId Assignment module ID.
     * @param {string} [siteId] Site ID. If not defined, current site.
     * @return {Promise<any>} Promise resolved with the assignment.
     */
    getVCac(courseId: number, cmid: number, siteId?: string, userid?:any): Promise<any> {
        return this.getVCacByField(courseId, 'cmid', cmid, siteId, userid);
    }


    /**
     * Get an assigment with key=value. If more than one is found, only the first will be returned.
     *
     * @param {number} courseId Course ID.
     * @param {string} key Name of the property to check.
     * @param {any} value Value to search.
     * @param {string} [siteId] Site ID. If not defined, current site.
     * @return {Promise<any>} Promise resolved when the assignment is retrieved.
     */
    protected getVCacByField(courseId: number, key: string, value: any, siteId?: string,userid?: any): Promise<any> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const params = {
                //  courseids: [courseId]
                context_id: value,
                user_id:userid
            }, 
                preSets = {
                    cacheKey: this.getVCCacheKey(courseId)
                };

            return site.read('mod_vedificvc_activity_completion', params, preSets).then((response) => {
                // Search the Lecture video to return.
                if (response) {
                    return response;
                }
                console.log(response);

                return Promise.reject(null);
            });
        });
    }

    seekVideoTime(percent:number, context_id: any, userid:any, siteId?:any): Promise<any>{
        
        return this.sitesProvider.getSite(siteId).then((site) => {
            const params = {
                room_id: context_id,
                user_id:userid,
                percent:percent
            }, 
                preSets = {
                    cacheKey: this.getVCCacheKey(context_id)
                };

            return site.write('mod_vedificvc_update_video_view', params, preSets);
        });
    
    }

    getDownloadableDoc(url: any, siteId?:any,context_id?: any): Promise<any> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            const params = {
                url:url
            },
            preSets = {
                cacheKey: this.getVCCacheKey(context_id)
            };
            return site.read('mod_vedificvc_file_download_url',params, preSets).then((response) => {
                // Search the Lecture video to return.
                if (response) {
                    return response;
                }
                console.log(response);

                return Promise.reject(null);
            });
        });
    }

    /**
     * Get cache key for assignment data WS calls.
     *
     * @param {number} courseId Course ID.
     * @return {string} Cache key.
     */
    protected getVCCacheKey(courseId: number): string {
        return this.ROOT_CACHE_KEY + 'lecture:' + courseId;
    }

    /**
     * Invalidate get badges WS call.
     *
     * @param {number} courseId Course ID.
     * @param {number} userId ID of the user to get the badges from.
     * @param {string} [siteId] Site ID. If not defined, current site.
     * @return {Promise<any>} Promise resolved when data is invalidated.
     */
    invalidateUserCache(courseId: number, userId?: number, siteId?: string): Promise<any> {
        return this.sitesProvider.getSite(siteId).then((site) => {
            return site.invalidateWsCacheForKey(this.getVCCacheKey(courseId));
        });
    }
}
