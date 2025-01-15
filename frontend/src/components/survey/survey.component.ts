
import { Component } from '@angular/core';
import { Model } from 'survey-core';
import { LayeredDarkPanelless } from "survey-core/themes/layered-dark-panelless";
import { ResultsService } from '../../services/results.service';
import { DataService } from '../../services/data.service';
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

    constructor(protected resultsService: ResultsService, private dataService: DataService, private errorService: GlobalErrorHandler) {
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
                variant: '',
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
                    variant: '',
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

                this.timer.start = Date.now();
                
                return;
            }

            if(options.oldCurrentPage.name === 'tutorial-nl') {
                this.timer.end = Date.now();

                console.log('📊 Tutorial Node-Link page');
                this.resultsService.pushResult({
                    index: -99,
                    time: this.timer.end - this.timer.start,
                    task: 'tutorial-nl',
                    encoding: '',
                    variant: '',
                    dataset: '',
                    level: '',
                    answer: ''
                }, true);

                this.timer.start = Date.now();
                return;
            }

            if(options.oldCurrentPage.name === 'tutorial-rep') {
                this.timer.end = Date.now();

                console.log('📊 Tutorial Representation page');
                this.resultsService.pushResult({
                    index: -99,
                    time: this.timer.end - this.timer.start,
                    task: 'tutorial-rep',
                    encoding: '',
                    variant: '',
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
                    task: options.oldCurrentPage.name.split('-')[1],
                    encoding: this.resultsService.getUserParams()?.encoding || 'unknown',
                    variant: '',
                    dataset: this.resultsService.getUserParams()?.dataset || 'unknown',
                    level: this.resultsService.getUserParams()?.level || 'unknown',
                    answer: sender.data[`${options.oldCurrentPage.name}`]
                }, true);

                // reset start time
                this.timer.start = Date.now();
                return;
            }

            if(options.oldCurrentPage.name === 'qualitative-feedback') {
                const qualitativeFeedback = {
                    learn: sender.data['rep-learn'],
                    use: sender.data['rep-use'],
                    aesth: sender.data['rep-aesth'],
                    acc: sender.data['rep-acc'],
                    quick: sender.data['rep-quick'],
                    comments: sender.data['rep-comments']
                };
    
                // push to results
                this.resultsService.pushResult({
                    index: -99,
                    time: 0,
                    task: 'qualitative-feedback',
                    encoding: this.resultsService.getUserParams()?.encoding || 'unknown',
                    variant: '',
                    dataset: this.resultsService.getUserParams()?.dataset || 'unknown',
                    level: this.resultsService.getUserParams()?.level || 'unknown',
                    answer: qualitativeFeedback
                });
                return;
            }
            
            // update end time and record result
            this.timer.end = Date.now();
            const time = this.timer.end - this.timer.start;
            

            // push to results
            this.resultsService.pushResult({
                index: options.oldCurrentPage.visibleIndex,
                time: time,
                task: options.oldCurrentPage.name.split('-')[1],
                // GET SUBSTRING FROM START TO options.newCurrentPage.name.split('-')[options.newCurrentPage.name.split('-').length - 1]
                variant: options.oldCurrentPage.name.split('-')[2],
                encoding: options.oldCurrentPage.name.split('-')[0],
                dataset: this.resultsService.getUserParams()?.dataset || 'unknown',
                level: this.resultsService.getUserParams()?.level || 'unknown',
                answer: sender.data[`${options.oldCurrentPage.name}-answer`]
            });
        });

        this.survey.onComplete.add((sender) => {
            console.log('🏁 Survey completed');

            const iceTFeedback = {
                "insight-1-1": sender.data['insight-1-1'],
                "insight-1-2": sender.data['insight-1-2'],
                "insight-1-3": sender.data['insight-1-3'],
                "insight-2-1": sender.data['insight-2-1'],
                "insight-2-2": sender.data['insight-2-2'],
                "insight-3-1": sender.data['insight-3-1'],
                "insight-3-2": sender.data['insight-3-2'],
                "insight-3-3": sender.data['insight-3-3'],
                "time-1-1": sender.data['time-1-1'],
                "time-1-2": sender.data['time-1-2'],
                "time-2-1": sender.data['time-2-1'],
                "time-2-2": sender.data['time-2-2'],
                "time-2-3": sender.data['time-2-3'],
                "essence-1-1": sender.data['essence-1-1'],
                "essence-1-2": sender.data['essence-1-2'],
                "essence-2-1": sender.data['essence-2-1'],
                "essence-2-2": sender.data['essence-2-2'],
                "confidence-1-1": sender.data['confidence-1-1'],
                "confidence-1-2": sender.data['confidence-1-2'],
                "confidence-2-1": sender.data['confidence-2-1'],
                "confidence-3-1": sender.data['confidence-3-1']
            };

               // push to results
            this.resultsService.pushResult({
                index: -99,
                time: 0,
                task: 'ice-t-feedback',
                encoding: this.resultsService.getUserParams()?.encoding || 'unknown',
                variant: '',
                dataset: this.resultsService.getUserParams()?.dataset || 'unknown',
                level: this.resultsService.getUserParams()?.level || 'unknown',
                answer: iceTFeedback
            });

            // post to backend
            this.resultsService.submitResults().subscribe((res: Response) => {
                if (res) {
                    console.log(res);
                    this.completed = true;
                    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank'); // TODO: Update with prolific link
                } else {
                    console.error('🚒 Error: no response received from backend');
                }
            });
        });
    }
};
