// create results service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SURVEY_JSON } from '../assets/survey.js';
import { DataService } from './data.service';
import { CONFIG } from '../assets/config';

type QualitativeAnswer = {
    
};

type DemographicAnswer = {
    prolificId: string,
    gender: string,
    ageGroup: string,
    education: string,
    familiarity: string
};

type AgreementAnswer = {
    confirm: string,
    agreement: string
};

export type Params = {
    user: string,
    encoding: string,
    dataset: string,
    level: string,
    taskCodes: Array<string>,
    taskDescriptions: Array<string>
};

export type Result = { 
    index: number,
    time: number, 
    task: string, 
    encoding: string, 
    variant: string,
    dataset: string,
    level: string,
    uncertainty: number,
    attribute: number,
    answer: string | number | QualitativeAnswer | DemographicAnswer | AgreementAnswer
} | {
    index: number,
    time: number,
    order: Array<string>,
    task?: string,
    encoding: string,
    variant: string,
    dataset: string,
    level: string,
    uncertainty: number,
    attribute: number,
};
@Injectable({
    providedIn: 'root'
})

export class ResultsService {
    private params: Params | null;
    private taskCounter: number = 0;

    protected questionMap: Map<string, string> = new Map([
        ['fuzzy', 'fuzzy-question'],
        ['wiggle', 'wiggle-question'],
        ['saturate', 'saturate-question'],
        ['enclose', 'enclose-question']
    ]);

    protected titleMap: Map<string, string> = new Map([
        ['fuzzy', 'Fuzziness'],
        ['wiggle', 'Wiggliness'],
        ['saturate', 'Saturation'],
        ['enclose', 'Enclosure']
    ]);

    protected taskInputType: Map<string, string> = new Map([
        ['t1', 'text'],
        ['t2', 'text'],
        ['t3', 'text'],
        ['t4', 'text'],
        ['t5', 'number'],
        ['t6', 'number'],
        ['t7', 'text'],
        ['t8', 'text'],
    ]);

    protected tutorialRepresenationTitle: Map<string, string> = new Map([
        ['fuzzy', 'Tutorial 2: Fuzziness'],
        ['wiggle', 'Tutorial 2: Wiggliness'],
        ['saturate', 'Tutorial 2: Saturation'],
        ['enclose', 'Tutorial 2: Enclosure']
    ]);

    protected uncertaintyAttributeTaskMap: Map<string, { uncertainty: number, attribute: number }> = new Map();


    protected tutorialRepresenation: Map<string, string> = new Map([
        ['fuzzy', `
            <p><b>Attributes:</b> Nodes can also have additional attributes mapped to them. In a social network, for example, in which each node represents a person, each person (node) could have their weight mapped to them. These attributes can be visually represented as well. In the example below, a hypothetical attribute has been mapped to the surface area of each node: the larger a node, the larger its attribute. In this example, node C has the largest attribute, as it is the largest node. Similarly, node F has the smallest attribute, as it is the smallest. Nodes A, B, and D are all equally large, and hence their attributes are also equally large.</p>
            <br />
            <p><b>Uncertainty:</b> However, these attributes can also be uncertain. This uncertainty can be represented in different ways. Here, uncertainty in each node's attribute has been mapped to the node's fuzziness: the blurrier the border of the node, the less certain we are in its attribute's value. Conversely, the crisper its border, the more certain we are in its attribute's value. In the given example, node A has the crispest outline of all nodes, so we are the most certain of its attribute's value. On the other hand, node B has the most blurry border, so we are the least certain of its attribute's value.</p>
            <br />
            <div style="margin: auto; width: auto;">
                <img src="assets/images/fuzziness.png" style="width: 30%; margin: auto; display: block; padding-bottom: 2em;"/>
            </div>
        `],
        ['wiggle', `
            <p><b>Attributes:</b> Nodes can also have additional attributes mapped to them. In a social network, for example, in which each node represents a person, each person (node) could have their weight mapped to them. These attributes can be visually represented as well. In the example below, a hypothetical attribute has been mapped to the surface area of each node: the larger a node, the larger its attribute. In this example, node C has the largest attribute, as it is the largest node. Similarly, node F has the smallest attribute, as it is the smallest. Nodes A, B, and D are all equally large, and hence their attributes are also equally large.</p>
            <br />
            <p><b>Uncertainty:</b> However, these attributes can also be uncertain. This uncertainty can be represented in different ways. Here, uncertainty is each node's attribute has been mapped to the node's wiggliness: the more a node wiggles, i.e. the more it moves around, the less certain we are in its attribute's value. Conversely, the less it wiggles, i.e. the less it moves around, the more certain we are in its node's attribute's value. Thus, in this particular example, node B is the most uncertain as it wiggles the most. Conversely, node A is the most certain as it hardly wiggles at all.</p>
            <br />
            <div style="margin: auto; width: auto;">
                <img src="assets/images/wiggliness.gif" style="width: 30%; margin: auto; display: block; padding-bottom: 2em;"/>
            </div>
        `],
        ['saturate', `
            <p><b>Attributes:</b> Nodes can also have additional attributes mapped to them. In a social network, for example, in which each node represents a person, each person (node) could have their weight mapped to them. These attributes can be visually represented as well. In the example below, a hypothetical attribute has been mapped to the surface area of each node: the larger a node, the larger its attribute. In this example, node C has the largest attribute, as it is the largest node. Similarly, node F has the smallest attribute, as it is the smallest. Nodes A, B, and D are all equally large, and hence their attributes are also equally large.</p>
            <br />
            <p><b>Uncertainty:</b> However, these attributes can also be uncertain. This uncertainty can be represented in different ways. Here, this uncertainty has been mapped to each node's saturation: the more saturated a node, the more certain we are in its attribute's value. Conversely, the less saturated a node, the less certain we are in its attribute's value. In the given example, node A is the most saturated node (the most orange), and, hence, we are the most certain in its attribute's value. Conversely, node B is the least saturated (the most grey), and hence, we are the least certain of its attribute's value.</p>
            <br />
            <div style="margin: auto; width: auto;">
                <img src="assets/images/saturation.png" style="width: 30%; margin: auto; display: block; padding-bottom: 2em;"/>
            </div>
        `],
        ['enclose', `
            <p><b>Attributes:</b> Nodes can also have additional attributes mapped to them. In a social network, for example, in which each node represents a person, each person (node) could have their weight mapped to them. These attributes can be visually represented as well. In the example below, a hypothetical attribute has been mapped to the surface area of each node: the larger a node, the larger its attribute. In this example, node C has the largest attribute, as it is the largest node. Similarly, node F has the smallest attribute, as it is the smallest. Nodes A, B, and D are all equally large, and hence their attributes are also equally large.</p>
            <br />
            <p><b>Uncertainty:</b> However, these attributes can also be uncertain. This uncertainty can be represented in different ways. Here, uncertainty in each node's attribute has been mapped to the node's enclosure: the thicker the border of a node, the less certain we are in its attribute's value. Conversely, the thinner a node's border, the more certain we are in its attribute's value. In this example, node A has the thinnest border, hence we are the most certain in its attribute's value. Conversely, node B has the thickest border, so we are the least certain of its attribute's value.</p>
            <br />
            <div style="margin: auto; width: auto;">
                <img src="assets/images/enclosure.png" style="width: 30%; margin: auto; display: block; padding-bottom: 2em;"/>
            </div>
        `]
    ]);

    private surveySetup: boolean = false;
    private dataSets: Array<string>;

    private results: Array<Result> = new Array<Result>();

    constructor(private http: HttpClient, private dataService: DataService) {
        this.params = null;

        this.dataSets = this.dataService.getDatasetNames();
    }

    setUserParams(params: Params): void {
        this.params = params;
    
        this.params.taskCodes.unshift('tutorial-rep');
        this.params.taskCodes.unshift('tutorial-nl');
        this.params.taskDescriptions.unshift('Tutorial on how to read uncertainty representations');
        this.params.taskDescriptions.unshift('Tutorial on how to read node-link diagrams');

        // add metadata to results
        this.results.push({
            index: -99,
            time: 0,
            order: this.params.taskCodes,
            encoding: this.params.encoding,
            variant: "",
            dataset: this.params.dataset,
            level: this.params.level,
            uncertainty: -1,
            attribute: -1
        });
    }

    getUncertaintyAttributeTask(task: string):{ uncertainty: number, attribute: number } {
        return this.uncertaintyAttributeTaskMap.get(task) || { uncertainty: -1, attribute: -1 };
    }

    public getFinalLevel(task: string, level: string): string {
        let finalLevel = '';

        const uncertaintyLevel = Math.random() < 0.5 ? '0' : '1';
        const attributeLevel = Math.random() < 0.5 ? '0' : '1';

        switch (task) { 
            case 't1': 
                finalLevel = level === 'low' ? '0.1' : '1.1'; 
                break;
            case 't2': 
                finalLevel = level === 'low' ? '0.0' : '1.0'; 
                break;
            case 't3': 
                finalLevel = level === 'high' ? '1.1' : '1.0'; 
                break;
            case 't4': 
                finalLevel = level === 'high' ? '0.1' : '0.0'; 
                break;
            default: 
                finalLevel = `${uncertaintyLevel}.${attributeLevel}`; 
                break;
        }

        this.uncertaintyAttributeTaskMap.set(task, {
            uncertainty: +finalLevel.split('.')[0],
            attribute: +finalLevel.split('.')[1]
        });

        console.log(task, level, finalLevel);
        console.log(this.uncertaintyAttributeTaskMap);

        return finalLevel;
    }

    getUserParams(): Params | null {
        return this.params;
    }

    getCurrentTask(): string {
        return this.params?.taskCodes[this.taskCounter] || '';
    }

    pushResult(result: Result, increment?: boolean): void {
        // pushes result to local array
        this.results.push(result);
        if(increment) this.taskCounter++;

        console.log(this.results);
    }

    setupSurvey(): void {
        if (this.params === null) return;
        
        const approach = this.params.encoding;

        // depending on approach plug in tutorial page
        const tutorialNL = {
            name: 'tutorial-nl',
            elements: [
                {
                    type: 'html',
                    html: `
                    <div>
                        <h2>Tutorial 1: What is a Node-Link Diagram?</h2>
                        <p style="padding-bottom:2em;">
                            A network consists of two types of elements: nodes and edges. Nodes represent entities, for example, people in a social network, and are presented as labeled circles. The labels are the identifier, i.e. ID, of each node. These nodes can be connected by edges, in which case nodes are said to be “adjacent” to or “neighbors” of each other. These edges represent relationships between nodes, for example, friendships in a social network. If two nodes A and B are connected by an edge, that edge can be represented as either (A, B) or (B, A). In the simple example below, five nodes A, B, C, D, and E are presented. In this example, the following seven edges exist: (A, B), (A, C), (A, D), (A, E), (B, D), (C, E), and (D, E). 
                        </p>
                        <div>
                            <img src="assets/images/node_link_diagram.png" style="width: 30%; margin: auto; padding-bottom: 2em; display: block;"/>
                        </div>
                    </div>`
                }
            ]
        };

        const tutorialREP = {
            name: 'tutorial-rep',
            elements: [
                {
                    type: 'html',
                    html: `
                    <div>
                        <h2>${this.tutorialRepresenationTitle.get(approach)}</h2>
                        <p>${this.tutorialRepresenation.get(approach)}</p>
                    </div>`
                }
            ]
        };


        // put tutorial page after intro page
        SURVEY_JSON.pages.splice(2, 0, tutorialNL);
        SURVEY_JSON.pages.splice(3, 0, tutorialREP);

        // iterate over this.params.eogNetApproaches
        let variant = 1;

        this.params.taskCodes.forEach((task, i) => {
            if(task === 'tutorial-nl' || task === 'tutorial-rep') return;

            // construct question
            const question = {
                name: `${approach}-${task}-${variant}`,
                elements: [
                    {
                        type: 'html',
                        html: `
                            <p id="metadata" style="display: none;">
                                ${this.params?.dataset}-${variant}-${this.params?.level}-${task}
                            </p>
                        ` 
                    },
                    {
                        type: this.questionMap.get(approach) as string,
                        description: this.titleMap.get(approach) as string,
                        title: this.params?.taskDescriptions[i],
                        name: `${approach}-${task}-${variant}`
                    },
                    {
                        type: 'text',
                        placeholder: this.taskInputType.get(task) === 'number' ? 'Enter your answer (number)' : 'Enter your answer here',
                        inputType: this.taskInputType.get(task) as string,
                        isRequired: true,
                        title: 'Answer',
                        name: `${approach}-${task}-${variant}-answer`
                    }
                ]
            };

            const feedback = {
                name: `${approach}-${task}-feedback`,
                elements: [
                    {
                        type: 'html',
                        html: `
                        <h3>The task was:</h3>
                        <p style="font-size: 1.5rem;">${this.params?.taskDescriptions[i]}</p>
                        `
                    },
                    {
                        type: 'comment', 
                        name: `${approach}-${task}-feedback`,
                        isRequired: false,
                        title: '(Optional) How did this uncertainty visualization assist or hinder you in solving this particular task?',
                        placeHolder: 'Enter your feedback here'
                    }
                ]
            };

            SURVEY_JSON.pages.push(question);
            SURVEY_JSON.pages.push(feedback);

            variant++;
        });

        // Move the feedback page to the end
        const feedbackPageIndex = SURVEY_JSON.pages.findIndex(page => page.name === 'qualitative-feedback');
        if (feedbackPageIndex !== -1) {
            const feedbackPage = SURVEY_JSON.pages.splice(feedbackPageIndex, 1)[0];
            SURVEY_JSON.pages.push(feedbackPage);
        }

        const iceTPageIndex = SURVEY_JSON.pages.findIndex(page => page.name === 'icet');
        if (iceTPageIndex !== -1) {
            const iceTPage = SURVEY_JSON.pages.splice(iceTPageIndex, 1)[0];
            SURVEY_JSON.pages.push(iceTPage);
        }

        console.log(SURVEY_JSON);
        
        this.surveySetup = true;
    }

    isSetup(): boolean {
        return this.surveySetup;
    }

    getEgoNetApproach(): string {
        return this.params?.encoding || 'fuzzy';
    }

    getSurvey(): any {
        return SURVEY_JSON;
    }

    submitResults(): Observable<any> {
        console.log(this.results);
        // submits results to backend
        return this.http.post(`${CONFIG.API_BASE}results`, { params: this.params, results: this.results });
    }
}