export class HistoryModel {
    _id;
    ticket;
    quantityAnswer;
    constructor(_id, ticket, quantityAnswer) {
        this._id = _id;
        this.ticket = ticket;
        this.quantityAnswer = quantityAnswer;
    }
}
