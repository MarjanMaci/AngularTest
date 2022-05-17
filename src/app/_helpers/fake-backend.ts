import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';
import { MyTask } from '@app/_models/mytask';

// array in local storage for registered users
const usersKey = 'users';
const tasksKey = 'tasks';

let users = JSON.parse(localStorage.getItem(usersKey)) || [];
let tasks = JSON.parse(localStorage.getItem(tasksKey)) || [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        return handleRoute();

        function handleRoute() {
            switch (true) {
                case url.endsWith('/account/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/account/registerNew') && method === 'POST':
                    return register();
                case url.endsWith('/tasks/getAll') && method === 'GET':
                    return getTasks();
                case url.match(/\/tasks\/\d+$/) && method === 'GET':
                    return getTaskById();
                case url.endsWith('/tasks/addNew') && method === 'POST':
                    return addTask();
                case url.match(/\/tasks\/\d+$/) && method === 'PUT':
                    return updateTask();
                case url.match(/\/tasks\/\d+$/) && method === 'DELETE':
                    return deleteTask();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            console.log("da")
            const { email, password } = body;
            const user = users.find(x => x.email === email && x.password === password);
            if (!user) return error('Email or password is incorrect');
            return ok({
                ...basicDetails(user),
                token: 'fake-jwt-token'
            })
        }

        function register() {
            const user = body

            if (users.find(x => x.email === user.email)) {
                return error('Email "' + user.email + '" is already taken')
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok();
        }

        function getTasks() {
            if (!isLoggedIn()) return unauthorized();
            const LoggedInUser = JSON.parse(localStorage.getItem("user"))
            const idLoggedUser = LoggedInUser.id;
            console.log(idLoggedUser)

            const tasksToReturn = tasks.filter(x => x.userId == idLoggedUser);
            console.log(tasksToReturn)
            return ok(tasksToReturn.map(x => basicDetails2(x)));
        }

        function getTaskById() {
            if (!isLoggedIn()) return unauthorized();

            const task = tasks.find(x => x.id === idFromUrl());
            return ok(basicDetails2(task));
        }

        function addTask() {
            const task:MyTask = body
            const LoggedInUser = JSON.parse(localStorage.getItem("user"))
            const idLoggedUser = LoggedInUser.id;
            
            task.id = tasks.length ? Math.max(...tasks.map(x => x.id)) + 1 : 1;
            task.created = new Date(Date.now());
            task.userId = idLoggedUser;

            tasks.push(task);
            localStorage.setItem(tasksKey, JSON.stringify(tasks));
            return ok();
        }

        function updateTask() {
            if (!isLoggedIn()) return unauthorized();

            let params = body;
            let task = tasks.find(x => x.id === idFromUrl());
            task.modified= new Date(Date.now());
            console.log(task)
            Object.assign(task, params);
            localStorage.setItem(tasksKey, JSON.stringify(tasks));

            return ok();
        }

        function deleteTask() {
            if (!isLoggedIn()) return unauthorized();

            tasks = tasks.filter(x => x.id !== idFromUrl());
            localStorage.setItem(tasksKey, JSON.stringify(tasks));
            return ok();
        }


        //helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // delay observable to simulate server api call
        }

        function error(message) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize()); // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
        }

        function basicDetails(user) {
            const { id, email } = user;
            return { id, email};
        }

        function basicDetails2(task) {
            const { id, description, from, to, status, created, modified, userId  } = task;
            return { id, description, from, to, status, created, modified, userId};
        }

        function isLoggedIn() {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};