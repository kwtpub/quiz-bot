import { TicketModel } from "../models/ticket.model";
export declare class ticketRepository {
    private tickets;
    private readonly ticketsPath;
    constructor(tickets?: TicketModel[], ticketsPath?: string);
    getAll(): TicketModel[];
    getTwoLeastAnsweredTickets(random?: () => number): TicketModel[];
    getLeastAnsweredTicketByNumberRange(startNumber: number, endNumber: number, random?: () => number): TicketModel | null;
    saveAll(tickets?: TicketModel[]): void;
    private static loadTicketsFromFile;
    private static toRecord;
    private static pickTwoLeastAnswered;
    private static pickLeastAnswered;
    private static pickRandomDistinct;
}
//# sourceMappingURL=ticket.repository.d.ts.map