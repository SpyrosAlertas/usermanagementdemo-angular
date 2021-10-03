export class ErrorModel {

    title: string;
    briefDescription: string;
    description: string;
    type: string;

    constructor(title: string, briefDescription: string, description: string, type: string = 'danger') {
        this.title = title;
        this.briefDescription = briefDescription;
        this.description = description;
        this.type = type;
    }

}
