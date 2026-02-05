"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyRepository = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const history_model_1 = require("../models/history.model");
const statusTicker_enum_1 = require("../enum/statusTicker.enum");
const ticket_model_1 = require("../models/ticket.model");
class historyRepository {
    history;
    historyPath;
    constructor(history, historyPath = (0, node_path_1.resolve)(process.cwd(), "src/data/history.json")) {
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
        const entries = tickets.map((ticket) => new history_model_1.HistoryModel(nextId++, ticket, ticket.understandingStatus));
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
        (0, node_fs_1.writeFileSync)(this.historyPath, JSON.stringify(data, null, 2), "utf-8");
    }
    static loadHistoryFromFile(path) {
        if (!(0, node_fs_1.existsSync)(path)) {
            (0, node_fs_1.writeFileSync)(path, "[]", "utf-8");
            return [];
        }
        const raw = (0, node_fs_1.readFileSync)(path, "utf-8").trim();
        if (!raw) {
            return [];
        }
        const data = JSON.parse(raw);
        return data.map((item) => new history_model_1.HistoryModel(item._id, new ticket_model_1.TicketModel(item.ticket._id, item.ticket.numberTicket, item.ticket.theme, item.ticket.text, item.ticket.countAnswer, item.ticket.understandingStatus), item.quantityAnswer ?? item.ticket.understandingStatus ?? statusTicker_enum_1.STATUS.NONE));
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
exports.historyRepository = historyRepository;
//# sourceMappingURL=histoty.repository.js.map