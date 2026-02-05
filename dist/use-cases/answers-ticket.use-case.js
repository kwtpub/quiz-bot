"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.answersTicketUseCase = answersTicketUseCase;
const inquirer_1 = __importDefault(require("inquirer"));
const statusTicker_enum_1 = require("../enum/statusTicker.enum");
const ticket_model_1 = require("../models/ticket.model");
const histoty_repository_1 = require("../repository/histoty.repository");
const ticket_repository_1 = require("../repository/ticket.repository");
const STATUS_CHOICES = [
    { name: "ХОРОШО — знаю уверенно", value: statusTicker_enum_1.STATUS.GOOD, short: statusTicker_enum_1.STATUS.GOOD },
    {
        name: "СРЕДНЕ — есть пробелы",
        value: statusTicker_enum_1.STATUS.AVERAGE,
        short: statusTicker_enum_1.STATUS.AVERAGE,
    },
    { name: "ПЛОХО — помню с трудом", value: statusTicker_enum_1.STATUS.BAD, short: statusTicker_enum_1.STATUS.BAD },
    { name: "НИКАК — не знаю", value: statusTicker_enum_1.STATUS.NONE, short: statusTicker_enum_1.STATUS.NONE },
];
async function answersTicketUseCase() {
    const ticketRepo = new ticket_repository_1.ticketRepository();
    const historyRepo = new histoty_repository_1.historyRepository();
    const tickets = [
        ticketRepo.getLeastAnsweredTicketByNumberRange(1, 30),
        ticketRepo.getLeastAnsweredTicketByNumberRange(31, 60),
    ].filter((ticket) => Boolean(ticket));
    if (tickets.length === 0) {
        console.log("Билеты не найдены.");
        return;
    }
    const answers = [];
    for (const ticket of tickets) {
        printTicket(ticket);
        const { status } = await inquirer_1.default.prompt([
            {
                type: "select",
                name: "status",
                message: "Как вы знаете этот билет?",
                choices: STATUS_CHOICES,
                pageSize: STATUS_CHOICES.length,
                loop: false,
            },
        ]);
        answers.push({ ticket, status });
    }
    const updatedTickets = updateTicketsAnswers(ticketRepo.getAll(), answers);
    ticketRepo.saveAll(updatedTickets);
    const answeredIds = new Set(answers.map((answer) => answer.ticket._id));
    const answeredTickets = updatedTickets.filter((ticket) => answeredIds.has(ticket._id));
    historyRepo.addEntries(answeredTickets);
}
function updateTicketsAnswers(allTickets, answers) {
    return allTickets.map((ticket) => {
        const answer = answers.find((item) => item.ticket._id === ticket._id);
        if (!answer) {
            return ticket;
        }
        return new ticket_model_1.TicketModel(ticket._id, ticket.numberTicket, ticket.theme, ticket.text, ticket.countAnswer + 1, answer.status);
    });
}
function printTicket(ticket) {
    console.log("\n========================");
    console.log(`Билет №${ticket.numberTicket}`);
    console.log(`Тема: ${ticket.theme}`);
    console.log(ticket.text);
    console.log("========================\n");
}
//# sourceMappingURL=answers-ticket.use-case.js.map