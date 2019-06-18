import {Component, OnInit, ViewChild} from '@angular/core';
import { Chart } from 'chart.js';
import { RestProvider, UserCourseProgress, UserSlidershowResponse } from '../../../../providers/rest/rest'
@Component({
    selector: 'home-custom-page',
    templateUrl: 'home-custom-page.html',
})
export class CoreSiteHomeCustomPageSummaryComponent implements OnInit {
    CourseProgressSummary: UserCourseProgress = { completed: 0, not_completed: 0, total_enrollment: 0 };
    UserSlideShow: UserSlidershowResponse = { showslideshow: 0, announcements: "",banner:[],marketing_tiles:[],my_courses:[] };
    pieChart: any;
    @ViewChild('pieCanvas') pieCanvas;

    constructor(public restProvider: RestProvider) {

    }
     ngOnInit(): void {
        this.restProvider.getCourses()
            .then(data => {
                this.CourseProgressSummary = data.courses;
            });

        this.restProvider.GetSliderData()
            .then(data => {
                this.UserSlideShow = data;
            });
        this.yourCustomFunctionName();
    } 
    public yourCustomFunctionName() {
        this.pieCanvas = new Chart(this.pieCanvas.nativeElement, {

            type: 'pie',
            data: {
                labels: ['Completed Courses', 'Pending Courses'],
                datasets: [{
                    label: '# of Votes',
                    data: [2, 2],
                    backgroundColor: [
                        //'rgba(255, 99, 132, 0.2)',
                        //'rgba(54, 162, 235, 0.2)',
                        //'rgba(255, 206, 86, 0.2)',
                        //'rgba(75, 192, 192, 0.2)',
                        'rgba(192, 32, 35, 0.9)',
                        'rgba(251, 156, 24, 0.9)'
                    ],
                    borderColor: [
                       // 'rgba(255, 99, 132, 1)',
                       // 'rgba(54, 162, 235, 1)',
                       // 'rgba(255, 206, 86, 1)',
                       // 'rgba(75, 192, 192, 1)',
                        'rgba(192, 32, 35, 0.9)',
                        'rgba(251, 156, 24, 0.9)'
                    ],
                    borderWidth: 1
                }]
            },
        });
    }

  
 
}