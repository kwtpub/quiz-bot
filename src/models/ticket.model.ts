import { STATUS } from "../enum/statusTicker.enum";

export class TicketModel {
 constructor(
    readonly _id: number,
    readonly numberTicket: number,
    readonly theme: string,
    readonly text: string,
    readonly countAnswer: number,
    readonly understandingStatus: STATUS
  ) {}
}
