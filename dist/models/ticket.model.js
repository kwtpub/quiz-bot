"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketModel = void 0;
class TicketModel {
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
exports.TicketModel = TicketModel;
//# sourceMappingURL=ticket.model.js.map