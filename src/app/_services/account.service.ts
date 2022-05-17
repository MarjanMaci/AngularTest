import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';
import { MyTask } from '@app/_models/mytask';


//Everything is packed in one service ... 

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;
    public task: Observable<MyTask>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(email, password) {
        return this.http.post<User>(`${environment.apiUrl}/account/authenticate`, { email, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                console.log(user)
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(user: User) {
        return this.http.post(`${environment.apiUrl}/account/registerNew`, user);
    }

    getTasks() {
        return this.http.get<MyTask[]>(`${environment.apiUrl}/tasks/getAll`);
    }

    getTaskById(id: Number) {
        return this.http.get<User>(`${environment.apiUrl}/tasks/${id}`);
    }

    addTask(task: MyTask) {
        console.log(task)
        return this.http.post(`${environment.apiUrl}/tasks/addNew`, task);
    }

    update(id:Number,params) {
        console.log(id, params)
        return this.http.put(`${environment.apiUrl}/tasks/${id}`, params)
            .pipe(map(x => {
                return x;
            }));
    }

    deleteTask(id: Number){
        return this.http.delete(`${environment.apiUrl}/tasks/${id}`)
        .pipe(map(x => {
                return x;
        }));
    }
}