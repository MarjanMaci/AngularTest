import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { MyTask } from '../_models/mytask';

import { AccountService } from '../_services/account.service';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {

    tasks:MyTask[] = null;

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.accountService.getTasks()
            .pipe(first())
            .subscribe(tasks => this.tasks = tasks);
            console.log(this.tasks)
    }

    deleteTask(id: Number) {
        const task = this.tasks.find(x => x.id === id);
        task.isDeleting = true;
        this.accountService.deleteTask(id)
        .pipe(first())
        .subscribe(() => this.tasks = this.tasks.filter(x => x.id !== id));
    }
}