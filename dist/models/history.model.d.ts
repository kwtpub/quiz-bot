import { STATUS } from "../enum/statusTicker.enum";
import { TicketModel } from "./ticket.model";
export declare class HistoryModel {
    readonly _id: number;
    readonly ticket: TicketModel;
    readonly quantityAnswer: STATUS;
    constructor(_id: number, ticket: TicketModel, quantityAnswer: STATUS);
}
//# sourceMappingURL=history.model.d.ts.map