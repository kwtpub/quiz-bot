import { STATUS } from "../enum/statusTicker.enum.js";
import { TicketModel } from "./ticket.model.js";

export class HistoryModel {
  constructor(
    readonly _id: number,
    readonly ticket: TicketModel,
    readonly quantityAnswer: STATUS
  ) {}
}
