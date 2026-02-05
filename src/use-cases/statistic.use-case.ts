import { STATUS } from "../enum/statusTicker.enum.js";
import { TicketModel } from "../models/ticket.model.js";
import { historyRepository } from "../repository/histoty.repository.js";
import { ticketRepository } from "../repository/ticket.repository.js";

type StatusStats = Record<STATUS, number>;

const STATUS_SCORES: Record<STATUS, number> = {
  [STATUS.GOOD]: 1,
  [STATUS.AVERAGE]: 0.6,
  [STATUS.BAD]: 0.3,
  [STATUS.NONE]: 0,
};

export function statisticUseCase(): void {
  const ticketRepo = new ticketRepository();
  const historyRepo = new historyRepository();

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
    formatStatusLine(STATUS.GOOD, knowledgeStats, totalTickets),
    formatStatusLine(STATUS.AVERAGE, knowledgeStats, totalTickets),
    formatStatusLine(STATUS.BAD, knowledgeStats, totalTickets),
    formatStatusLine(STATUS.NONE, knowledgeStats, totalTickets),
  ]);

  printRangeStats("Диапазон 1–30", tickets, 1, 30);
  printRangeStats("Диапазон 31–60", tickets, 31, 60);

  const history = historyRepo.getAll();
  const historyStats = statusStats(history.map((item) => item.quantityAnswer));
  printSection("История ответов", [
    `Всего записей: ${history.length}`,
    formatStatusLine(STATUS.GOOD, historyStats, history.length),
    formatStatusLine(STATUS.AVERAGE, historyStats, history.length),
    formatStatusLine(STATUS.BAD, historyStats, history.length),
    formatStatusLine(STATUS.NONE, historyStats, history.length),
  ]);

  printWeakTickets(tickets);
}

function printRangeStats(
  title: string,
  tickets: TicketModel[],
  start: number,
  end: number,
): void {
  const rangeTickets = tickets.filter(
    (ticket) => ticket.numberTicket >= start && ticket.numberTicket <= end,
  );

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
    formatStatusLine(STATUS.GOOD, stats, rangeTickets.length),
    formatStatusLine(STATUS.AVERAGE, stats, rangeTickets.length),
    formatStatusLine(STATUS.BAD, stats, rangeTickets.length),
    formatStatusLine(STATUS.NONE, stats, rangeTickets.length),
  ]);
}

function printWeakTickets(tickets: TicketModel[]): void {
  const byNeed = [...tickets].sort((a, b) => {
    if (a.countAnswer !== b.countAnswer) {
      return a.countAnswer - b.countAnswer;
    }
    const aScore = getScore(a.understandingStatus);
    const bScore = getScore(b.understandingStatus);
    if (aScore !== bScore) {
      return aScore - bScore;
    }
    return a.numberTicket - b.numberTicket;
  });

  const top = byNeed.slice(0, 5);
  if (top.length === 0) {
    return;
  }

  const lines = top.map(
    (ticket) =>
      `Билет №${ticket.numberTicket}: ответы ${ticket.countAnswer}, статус ${ticket.understandingStatus}`,
  );
  printSection("Топ-5 билетов для повторения", lines);
}

function statusStats(statuses: STATUS[]): StatusStats {
  return statuses.reduce<StatusStats>(
    (acc, status) => {
      acc[status] = getStat(acc, status) + 1;
      return acc;
    },
    {
      [STATUS.GOOD]: 0,
      [STATUS.AVERAGE]: 0,
      [STATUS.BAD]: 0,
      [STATUS.NONE]: 0,
    },
  );
}

function calculateKnowledgeScore(stats: StatusStats, total: number): string {
  if (total === 0) {
    return "0%";
  }
  const weighted =
    getStat(stats, STATUS.GOOD) * getScore(STATUS.GOOD) +
    getStat(stats, STATUS.AVERAGE) * getScore(STATUS.AVERAGE) +
    getStat(stats, STATUS.BAD) * getScore(STATUS.BAD) +
    getStat(stats, STATUS.NONE) * getScore(STATUS.NONE);

  return `${((weighted / total) * 100).toFixed(1)}%`;
}

function formatStatusLine(
  status: STATUS,
  stats: StatusStats,
  total: number,
): string {
  const count = getStat(stats, status);
  return `${status}: ${count} (${percent(count, total)})`;
}

function percent(part: number, total: number): string {
  if (total === 0) {
    return "0%";
  }
  return `${((part / total) * 100).toFixed(1)}%`;
}

function average(total: number, count: number): string {
  if (count === 0) {
    return "0";
  }
  return (total / count).toFixed(2);
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function getStat(stats: StatusStats, status: STATUS): number {
  return stats[status] ?? 0;
}

function getScore(status: STATUS): number {
  return STATUS_SCORES[status] ?? 0;
}

function printSection(title: string, lines: string[]): void {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
  for (const line of lines) {
    console.log(line);
  }
}
