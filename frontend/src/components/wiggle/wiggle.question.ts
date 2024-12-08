import { AfterViewInit, ChangeDetectorRef, Component, ViewContainerRef } from '@angular/core';
import { ElementFactory, Question, Serializer } from 'survey-core';
import { AngularComponentFactory, QuestionAngular } from 'survey-angular-ui';

const CUSTOM_TYPE = 'wiggle-question';


@Component({
    selector: 'wiggle-question',
    template: `
        <app-wiggle></app-wiggle>
    `,
})

export class CustomWiggleQuestionComponent extends QuestionAngular<CustomWiggleQuestionModel> implements AfterViewInit {
    // call the constructor of the super class
    constructor(
        containerRef: ViewContainerRef,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(changeDetectorRef, containerRef);
    }
}

AngularComponentFactory.Instance.registerComponent(CUSTOM_TYPE + '-question', CustomWiggleQuestionComponent);

export class CustomWiggleQuestionModel extends Question {
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
    return new CustomWiggleQuestionModel(name);
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
        return new CustomWiggleQuestionModel('');
    },
    'question'
);