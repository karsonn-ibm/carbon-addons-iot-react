import { Component, Input } from '@angular/core';
import { ListItem } from 'carbon-components-angular';
import { Observable } from 'rxjs';
import {
  filterRulesById,
  findRulePathById,
  generateRule,
  generateRuleGroup,
  insertRuleAfterPath,
} from './utils';

@Component({
  selector: 'ai-rule-builder',
  template: `
    <div>
      <ai-rule-builder-header
        [(groupLogic)]="tree.groupLogic"
        (addRule)="handleAddRule($event.id, $event.isGroup)"
      ></ai-rule-builder-header>
      <ng-container *ngFor="let rule of tree.rules; let i = index">
        <ai-rule
          (addRule)="handleAddRule($event.id, $event.isGroup)"
          (removeRule)="handleRemoveRule($event)"
          [columns]="columns"
          [columnOperands]="columnOperands"
          [(rule)]="tree.rules[i]"
        ></ai-rule>
      </ng-container>
    </div>
  `,
})
export class RuleBuilderComponent {
  @Input() columns: Array<any> = [];
  @Input() columnOperands: Array<ListItem> = [
    { content: 'Not equal', id: 'ne', selected: false },
    { content: 'Less than', id: 'lt', selected: false },
    { content: 'Less than or equal to', id: 'ltoet', selected: false },
    { content: 'Equals', id: 'eq', selected: false },
    { content: 'Greater than or equal to', id: 'gtoet', selected: false },
    { content: 'Greater than', id: 'gt', selected: false },
    { content: 'Contains', id: 'con', selected: false },
  ];

  /**
   * Example Structure:
   * {
   *   id: '14p5ho3pcu',
   *   groupLogic: 'all',
   *   rules: [
   *     {
   *       id: 'rsiru4rjba',
   *       columnId: 'column2',
   *       operand: 'eq',
   *       value: '45',
   *     },
   *     {
   *       id: 'i34imt0geh',
   *       groupLogic: 'any',
   *       rules: [
   *         {
   *           id: 'ewc2z5kyfu',
   *           columnId: 'column2',
   *           operand: 'gtoet',
   *           value: '46',
   *         },
   *       ],
   *     }
   *   ]
   * }
   */
  @Input() tree: any; // TODO

  constructor() {}

  handleAddRule(id: string, isGroup) {
    const generate = isGroup ? generateRuleGroup : generateRule;

    if (id) {
      const rulePath = findRulePathById(this.tree.rules, id);
      insertRuleAfterPath(this.tree.rules, generate(), rulePath);
      return;
    }

    this.tree.rules.push(generate());
  }

  handleRemoveRule(id: string) {
    this.tree.rules = filterRulesById(this.tree.rules, id);
  }
}
