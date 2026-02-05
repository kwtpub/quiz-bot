import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { HistoryModel } from "../models/history.model.js";
import { STATUS } from "../enum/statusTicker.enum.js";
import { TicketModel } from "../models/ticket.model.js";

type TicketRecord = {
  _id: number;
  numberTicket: number;
  theme: string;
  text: string;
  countAnswer: number;
  understandingStatus: STATUS;
};

type HistoryRecord = {
  _id: number;
  ticket: TicketRecord;
  quantityAnswer: STATUS;
};

export class historyRepository {
  private history: HistoryModel[];
  private readonly historyPath: string;

  constructor(
    history?: HistoryModel[],
    historyPath: string = resolve(process.cwd(), "src/data/history.json"),
  ) {
    this.historyPath = historyPath;
    this.history = history ?? historyRepository.loadHistoryFromFile(historyPath);
  }

  getAll(): HistoryModel[] {
    return [...this.history];
  }

  addEntries(tickets: TicketModel[]): HistoryModel[] {
    if (tickets.length === 0) {
      return [];
    }

    let nextId = this.nextId();
    const entries = tickets.map(
      (ticket) =>
        new HistoryModel(nextId++, ticket, ticket.understandingStatus),
    );

    this.history = [...this.history, ...entries];
    this.saveAll();

    return entries;
  }

  private nextId(): number {
    let maxId = 0;
    for (const item of this.history) {
      if (item._id > maxId) {
        maxId = item._id;
      }
    }
    return maxId + 1;
  }

  private saveAll(): void {
    const data = this.history.map(historyRepository.toRecord);
    writeFileSync(this.historyPath, JSON.stringify(data, null, 2), "utf-8");
  }

  private static loadHistoryFromFile(path: string): HistoryModel[] {
    if (!existsSync(path)) {
      writeFileSync(path, "[]", "utf-8");
      return [];
    }

    const raw = readFileSync(path, "utf-8").trim();
    if (!raw) {
      return [];
    }

    const data = JSON.parse(raw) as HistoryRecord[];
    return data.map(
      (item) =>
        new HistoryModel(
          item._id,
          new TicketModel(
            item.ticket._id,
            item.ticket.numberTicket,
            item.ticket.theme,
            item.ticket.text,
            item.ticket.countAnswer,
            item.ticket.understandingStatus,
          ),
          item.quantityAnswer ?? item.ticket.understandingStatus ?? STATUS.NONE,
        ),
    );
  }

  private static toRecord(item: HistoryModel): HistoryRecord {
    return {
      _id: item._id,
      ticket: {
        _id: item.ticket._id,
        numberTicket: item.ticket.numberTicket,
        theme: item.ticket.theme,
        text: item.ticket.text,
        countAnswer: item.ticket.countAnswer,
        understandingStatus: item.ticket.understandingStatus,
      },
      quantityAnswer: item.quantityAnswer,
    };
  }
}
