import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { HistoryModel } from "../models/history.model.js";
import { STATUS } from "../enum/statusTicker.enum.js";
import { TicketModel } from "../models/ticket.model.js";
export class historyRepository {
    history;
    historyPath;
    constructor(history, historyPath = resolve(process.cwd(), "src/data/history.json")) {
        this.historyPath = historyPath;
        this.history = history ?? historyRepository.loadHistoryFromFile(historyPath);
    }
    getAll() {
        return [...this.history];
    }
    addEntries(tickets) {
        if (tickets.length === 0) {
            return [];
        }
        let nextId = this.nextId();
        const entries = tickets.map((ticket) => new HistoryModel(nextId++, ticket, ticket.understandingStatus));
        this.history = [...this.history, ...entries];
        this.saveAll();
        return entries;
    }
    nextId() {
        let maxId = 0;
        for (const item of this.history) {
            if (item._id > maxId) {
                maxId = item._id;
            }
        }
        return maxId + 1;
    }
    saveAll() {
        const data = this.history.map(historyRepository.toRecord);
        writeFileSync(this.historyPath, JSON.stringify(data, null, 2), "utf-8");
    }
    static loadHistoryFromFile(path) {
        if (!existsSync(path)) {
            writeFileSync(path, "[]", "utf-8");
            return [];
        }
        const raw = readFileSync(path, "utf-8").trim();
        if (!raw) {
            return [];
        }
        const data = JSON.parse(raw);
        return data.map((item) => new HistoryModel(item._id, new TicketModel(item.ticket._id, item.ticket.numberTicket, item.ticket.theme, item.ticket.text, item.ticket.countAnswer, item.ticket.understandingStatus), item.quantityAnswer ?? item.ticket.understandingStatus ?? STATUS.NONE));
    }
    static toRecord(item) {
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
