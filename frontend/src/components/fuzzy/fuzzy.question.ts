import { AfterViewInit, ChangeDetectorRef, Component, ViewContainerRef } from '@angular/core';
import { ElementFactory, Question, Serializer } from 'survey-core';
import { AngularComponentFactory, QuestionAngular } from 'survey-angular-ui';

const CUSTOM_TYPE = 'fuzzy-question';


@Component({
    selector: 'fuzzy-question',
    template: `
        <app-fuzzy></app-fuzzy>
    `,
})

export class CustomFuzzyQuestionComponent extends QuestionAngular<CustomFuzzyQuestionModel> implements AfterViewInit {
    // call the constructor of the super class
    constructor(
        containerRef: ViewContainerRef,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(changeDetectorRef, containerRef);
    }
}

AngularComponentFactory.Instance.registerComponent(CUSTOM_TYPE + '-question', CustomFuzzyQuestionComponent);

export class CustomFuzzyQuestionModel extends Question {
    override getType() {
        return CUSTOM_TYPE;
    }

    override get name() {
        return this.getPropertyValue('name');
    }

    override set name(value) {
        this.setPropertyValue('name', value);
    }
}


ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new CustomFuzzyQuestionModel(name);
});

Serializer.addClass(
    CUSTOM_TYPE,
    [
        {
            name: 'description'
        },
        {
            name: 'title'
        }
    ],
    () => {
        return new CustomFuzzyQuestionModel('');
    },
    'question'
);