export type status = "Work in progress" | "Deleted" | "Done" | "ToDo";

export class MyTask {
    id: Number;
    description: string;
    from: Date;
    to: Date;
    status: status;
    created: Date;
    modified: Date;
    userId: string;
    //outside of declaration
    isDeleting:any;
}