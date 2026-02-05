"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticUseCase = statisticUseCase;
const statusTicker_enum_1 = require("../enum/statusTicker.enum");
const histoty_repository_1 = require("../repository/histoty.repository");
const ticket_repository_1 = require("../repository/ticket.repository");
const STATUS_SCORES = {
    [statusTicker_enum_1.STATUS.GOOD]: 1,
    [statusTicker_enum_1.STATUS.AVERAGE]: 0.6,
    [statusTicker_enum_1.STATUS.BAD]: 0.3,
    [statusTicker_enum_1.STATUS.NONE]: 0,
};
function statisticUseCase() {
    const ticketRepo = new ticket_repository_1.ticketRepository();
    const historyRepo = new histoty_repository_1.historyRepository();
    const tickets = ticketRepo.getAll();
    if (tickets.length === 0) {
        console.log("Билеты не найдены.");
        return;
    }
    const totalTickets = tickets.length;
    const totalAnswers = sum(tickets.map((ticket) => ticket.countAnswer));
    const answeredTickets = tickets.filter((ticket) => ticket.countAnswer > 0).length;
    const knowledgeStats = statusStats(tickets.map((ticket) => ticket.understandingStatus));
    const knowledgeScore = calculateKnowledgeScore(knowledgeStats, totalTickets);
    printSection("Общая статистика", [
        `Всего билетов: ${totalTickets}`,
        `Билетов с ответами: ${answeredTickets} (${percent(answeredTickets, totalTickets)})`,
        `Всего ответов: ${totalAnswers}`,
        `Среднее ответов на билет: ${average(totalAnswers, totalTickets)}`,
        `Индекс знаний (эвристика): ${knowledgeScore}`,
    ]);
    printSection("Текущий уровень знаний (по последнему ответу)", [
        formatStatusLine(statusTicker_enum_1.STATUS.GOOD, knowledgeStats, totalTickets),
        formatStatusLine(statusTicker_enum_1.STATUS.AVERAGE, knowledgeStats, totalTickets),
        formatStatusLine(statusTicker_enum_1.STATUS.BAD, knowledgeStats, totalTickets),
        formatStatusLine(statusTicker_enum_1.STATUS.NONE, knowledgeStats, totalTickets),
    ]);
    printRangeStats("Диапазон 1–30", tickets, 1, 30);
    printRangeStats("Диапазон 31–60", tickets, 31, 60);
    const history = historyRepo.getAll();
    const historyStats = statusStats(history.map((item) => item.quantityAnswer));
    printSection("История ответов", [
        `Всего записей: ${history.length}`,
        formatStatusLine(statusTicker_enum_1.STATUS.GOOD, historyStats, history.length),
        formatStatusLine(statusTicker_enum_1.STATUS.AVERAGE, historyStats, history.length),
        formatStatusLine(statusTicker_enum_1.STATUS.BAD, historyStats, history.length),
        formatStatusLine(statusTicker_enum_1.STATUS.NONE, historyStats, history.length),
    ]);
    printWeakTickets(tickets);
}
function printRangeStats(title, tickets, start, end) {
    const rangeTickets = tickets.filter((ticket) => ticket.numberTicket >= start && ticket.numberTicket <= end);
    if (rangeTickets.length === 0) {
        printSection(title, ["Нет билетов в диапазоне."]);
        return;
    }
    const answered = rangeTickets.filter((ticket) => ticket.countAnswer > 0).length;
    const totalAnswers = sum(rangeTickets.map((ticket) => ticket.countAnswer));
    const stats = statusStats(rangeTickets.map((ticket) => ticket.understandingStatus));
    const knowledgeScore = calculateKnowledgeScore(stats, rangeTickets.length);
    printSection(title, [
        `Билетов: ${rangeTickets.length}`,
        `Билетов с ответами: ${answered} (${percent(answered, rangeTickets.length)})`,
        `Всего ответов: ${totalAnswers}`,
        `Среднее ответов на билет: ${average(totalAnswers, rangeTickets.length)}`,
        `Индекс знаний (эвристика): ${knowledgeScore}`,
        formatStatusLine(statusTicker_enum_1.STATUS.GOOD, stats, rangeTickets.length),
        formatStatusLine(statusTicker_enum_1.STATUS.AVERAGE, stats, rangeTickets.length),
        formatStatusLine(statusTicker_enum_1.STATUS.BAD, stats, rangeTickets.length),
        formatStatusLine(statusTicker_enum_1.STATUS.NONE, stats, rangeTickets.length),
    ]);
}
function printWeakTickets(tickets) {
    const byNeed = [...tickets].sort((a, b) => {
        if (a.countAnswer !== b.countAnswer) {
            return a.countAnswer - b.countAnswer;
        }
        const aScore = STATUS_SCORES[a.understandingStatus];
        const bScore = STATUS_SCORES[b.understandingStatus];
        if (aScore !== bScore) {
            return aScore - bScore;
        }
        return a.numberTicket - b.numberTicket;
    });
    const top = byNeed.slice(0, 5);
    if (top.length === 0) {
        return;
    }
    const lines = top.map((ticket) => `Билет №${ticket.numberTicket}: ответы ${ticket.countAnswer}, статус ${ticket.understandingStatus}`);
    printSection("Топ-5 билетов для повторения", lines);
}
function statusStats(statuses) {
    return statuses.reduce((acc, status) => {
        acc[status] += 1;
        return acc;
    }, {
        [statusTicker_enum_1.STATUS.GOOD]: 0,
        [statusTicker_enum_1.STATUS.AVERAGE]: 0,
        [statusTicker_enum_1.STATUS.BAD]: 0,
        [statusTicker_enum_1.STATUS.NONE]: 0,
    });
}
function calculateKnowledgeScore(stats, total) {
    if (total === 0) {
        return "0%";
    }
    const weighted = stats[statusTicker_enum_1.STATUS.GOOD] * STATUS_SCORES[statusTicker_enum_1.STATUS.GOOD] +
        stats[statusTicker_enum_1.STATUS.AVERAGE] * STATUS_SCORES[statusTicker_enum_1.STATUS.AVERAGE] +
        stats[statusTicker_enum_1.STATUS.BAD] * STATUS_SCORES[statusTicker_enum_1.STATUS.BAD] +
        stats[statusTicker_enum_1.STATUS.NONE] * STATUS_SCORES[statusTicker_enum_1.STATUS.NONE];
    return `${((weighted / total) * 100).toFixed(1)}%`;
}
function formatStatusLine(status, stats, total) {
    return `${status}: ${stats[status]} (${percent(stats[status], total)})`;
}
function percent(part, total) {
    if (total === 0) {
        return "0%";
    }
    return `${((part / total) * 100).toFixed(1)}%`;
}
function average(total, count) {
    if (count === 0) {
        return "0";
    }
    return (total / count).toFixed(2);
}
function sum(values) {
    return values.reduce((acc, value) => acc + value, 0);
}
function printSection(title, lines) {
    console.log(`\n${title}`);
    console.log("-".repeat(title.length));
    for (const line of lines) {
        console.log(line);
    }
}
//# sourceMappingURL=statistic.use-case.js.map