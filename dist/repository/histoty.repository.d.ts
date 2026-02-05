import { HistoryModel } from "../models/history.model";
import { TicketModel } from "../models/ticket.model";
export declare class historyRepository {
    private history;
    private readonly historyPath;
    constructor(history?: HistoryModel[], historyPath?: string);
    getAll(): HistoryModel[];
    addEntries(tickets: TicketModel[]): HistoryModel[];
    private nextId;
    private saveAll;
    private static loadHistoryFromFile;
    private static toRecord;
}
//# sourceMappingURL=histoty.repository.d.ts.map