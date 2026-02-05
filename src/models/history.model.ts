import { STATUS } from "../enum/statusTicker.enum";
import { TicketModel } from "./ticket.model";

export class HistoryModel {
  constructor(
    readonly _id: number,
    readonly ticket: TicketModel,
    readonly quantityAnswer: STATUS
  ) {}
}
