
import { Component } from '@angular/core';
import { Model } from 'survey-core';
import { LayeredDarkPanelless } from "survey-core/themes/layered-dark-panelless";
import { ResultsService } from '../../services/results.service';
import { GlobalErrorHandler } from '../../services/error.service';

@Component({
    selector: 'app-survey',
    templateUrl: './survey.component.html',
    styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
    protected survey: Model;
    protected completed: boolean = false;

    private timer: {
        start: number,
        end: number
    };

    constructor(protected resultsService: ResultsService, private errorService: GlobalErrorHandler) {
        this.survey = new Model();
        
        this.timer = {
            start: 0,
            end: 0
        };   
    }  
    
    ngAfterViewInit() {
        try {
            this.survey.onAfterRenderSurvey.add(this.init.bind(this));
        } catch (error) {
            this.errorService.handleError(error);
        }
    }
    
    
    init(): void {
        // check if survey is setup already if not try again in 1 second
        if (!this.resultsService.isSetup()) {
            setTimeout(() => this.init(), 1000);
            return;
        }

        const survey = new Model(this.resultsService.getSurvey());
        // survey.applyTheme(LayeredDarkPanelless);       

        this.survey = survey;
        
        this.survey.onStarted.add((sender, options) => {
            this.resultsService.pushResult({
                index: -99,
                time: 0,
                task: 'intro',
                encoding: '',
                dataset: '',
                level: '',
                answer: {
                    confirm: sender.data['question_intro_confirm'],
                    agreement: sender.data['question_intro_agree']
                }
            });
            console.log('⏰ Survey started');
        });
    
        this.survey.onCurrentPageChanged.add((sender, options) => {
            if(options.oldCurrentPage.name === 'demographics') {
                console.log('📊 Demographics page');

                this.resultsService.pushResult({
                    index: -99,
                    time: 0,
                    task: 'demographics',
                    encoding: '',
                    dataset: '',
                    level: '',
                    answer: {
                        prolificId: sender.data['prolific_id'],
                        gender: sender.data['gender'],
                        ageGroup: sender.data['age'],
                        education: sender.data['education'],
                        familiarity: sender.data['network_knowledge'],
                    }
                });
                
                return;
            }

            if(options.oldCurrentPage.name === 'tutorial') {
                console.log('📊 Tutorial Node-Link page');
                this.resultsService.pushResult({
                    index: -99,
                    time: 0,
                    task: 'tutorial-nl',
                    encoding: '',
                    dataset: '',
                    level: '',
                    answer: ''
                }, true);

                this.timer.start = Date.now();
                return;
            }

            if(options.oldCurrentPage.name === 'tutorial-rep') {
                console.log('📊 Tutorial Representation page');
                this.resultsService.pushResult({
                    index: -99,
                    time: 0,
                    task: 'tutorial-rep',
                    encoding: '',
                    dataset: '',
                    level: '',
                    answer: ''
                }, true);

                this.timer.start = Date.now();
                return;
            }

            if(options.oldCurrentPage.name.includes('feedback') && options.oldCurrentPage.name !== 'qualitative-feedback') {
                // push to results
                this.resultsService.pushResult({
                    index: -99,
                    time: 0,
                    task: options.oldCurrentPage.name,
                    encoding: '',
                    dataset: '',
                    level: '',
                    answer: sender.data[`${options.oldCurrentPage.name}`]
                }, true);

                // reset start time
                this.timer.start = Date.now();
                return;
            }
            
            // update end time and record result
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;

            // push to results
            this.resultsService.pushResult({
                index: options.oldCurrentPage.visibleIndex,
                time: time,
                task: options.oldCurrentPage.name.split('-')[options.oldCurrentPage.name.split('-').length - 1],
                // GET SUBSTRING FROM START TO options.newCurrentPage.name.split('-')[options.newCurrentPage.name.split('-').length - 1]
                encoding: options.oldCurrentPage.name.split('-')[0],
                dataset: options.oldCurrentPage.name.split('-')[1],
                level: options.oldCurrentPage.name.split('-')[2],
                answer: sender.data[`${options.oldCurrentPage.name}-answer`]
            });
        });

        this.survey.onComplete.add((sender) => {
            const qualitativeFeedback = {
                learn: sender.data['ego-rep-learn'],
                use: sender.data['ego-rep-use'],
                aesth: sender.data['ego-rep-aesth'],
                acc: sender.data['ego-rep-acc'],
                quick: sender.data['ego-rep-quick'],
                comments: sender.data['ego-rep-comments']
            };

            // push to results
            this.resultsService.pushResult({
                index: -99,
                time: 0,
                task: 'qualitative-feedback',
                encoding: '',
                dataset: '',
                level: '',
                answer: qualitativeFeedback
            });

            // post to backend
            this.resultsService.submitResults().subscribe((res: Response) => {
                if (res) {
                    console.log(res);
                    this.completed = true;
                    window.open('https://app.prolific.com/submissions/complete?cc=C1I2U9RJ', '_blank'); // TODO: Update with prolific link
                } else {
                    console.error('🚒 Error: no response received from backend');
                }
            });
        });
    }
};
