import { AfterViewInit, ChangeDetectorRef, Component, ViewContainerRef } from '@angular/core';
import { ElementFactory, Question, Serializer } from 'survey-core';
import { AngularComponentFactory, QuestionAngular } from 'survey-angular-ui';

const CUSTOM_TYPE = 'enclose-question';


@Component({
    selector: 'enclose-question',
    template: `
        <app-enclose></app-enclose>
    `,
})

export class CustomEncloseQuestionComponent extends QuestionAngular<CustomEncloseQuestionModel> implements AfterViewInit {
    // call the constructor of the super class
    constructor(
        containerRef: ViewContainerRef,
        changeDetectorRef: ChangeDetectorRef
    ) {
        super(changeDetectorRef, containerRef);
    }
}

AngularComponentFactory.Instance.registerComponent(CUSTOM_TYPE + '-question', CustomEncloseQuestionComponent);

export class CustomEncloseQuestionModel extends Question {
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
    return new CustomEncloseQuestionModel(name);
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
        return new CustomEncloseQuestionModel('');
    },
    'question'
);