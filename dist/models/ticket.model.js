export class TicketModel {
    _id;
    numberTicket;
    theme;
    text;
    countAnswer;
    understandingStatus;
    constructor(_id, numberTicket, theme, text, countAnswer, understandingStatus) {
        this._id = _id;
        this.numberTicket = numberTicket;
        this.theme = theme;
        this.text = text;
        this.countAnswer = countAnswer;
        this.understandingStatus = understandingStatus;
    }
}
