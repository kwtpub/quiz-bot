import { STATUS } from "../enum/statusTicker.enum";
export declare class TicketModel {
    readonly _id: number;
    readonly numberTicket: number;
    readonly theme: string;
    readonly text: string;
    readonly countAnswer: number;
    readonly understandingStatus: STATUS;
    constructor(_id: number, numberTicket: number, theme: string, text: string, countAnswer: number, understandingStatus: STATUS);
}
//# sourceMappingURL=ticket.model.d.ts.map