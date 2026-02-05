import inquirer from "inquirer";
import { STATUS } from "../enum/statusTicker.enum.js";
import { TicketModel } from "../models/ticket.model.js";
import { historyRepository } from "../repository/histoty.repository.js";
import { ticketRepository } from "../repository/ticket.repository.js";

type AnswerResult = {
  ticket: TicketModel;
  status: STATUS;
};

const STATUS_CHOICES = [
  { name: "ХОРОШО — знаю уверенно", value: STATUS.GOOD, short: STATUS.GOOD },
  {
    name: "СРЕДНЕ — есть пробелы",
    value: STATUS.AVERAGE,
    short: STATUS.AVERAGE,
  },
  { name: "ПЛОХО — помню с трудом", value: STATUS.BAD, short: STATUS.BAD },
  { name: "НИКАК — не знаю", value: STATUS.NONE, short: STATUS.NONE },
];

export async function answersTicketUseCase(): Promise<void> {
  const ticketRepo = new ticketRepository();
  const historyRepo = new historyRepository();

  const tickets = [
    ticketRepo.getLeastAnsweredTicketByNumberRange(1, 30),
    ticketRepo.getLeastAnsweredTicketByNumberRange(31, 60),
  ].filter((ticket): ticket is TicketModel => Boolean(ticket));
  if (tickets.length === 0) {
    console.log("Билеты не найдены.");
    return;
  }

  const answers: AnswerResult[] = [];

  for (const ticket of tickets) {
    printTicket(ticket);
    const { status } = await inquirer.prompt<{ status: STATUS }>([
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
  const answeredTickets = updatedTickets.filter((ticket) =>
    answeredIds.has(ticket._id),
  );
  historyRepo.addEntries(answeredTickets);
}

function updateTicketsAnswers(
  allTickets: TicketModel[],
  answers: AnswerResult[],
): TicketModel[] {
  return allTickets.map((ticket) => {
    const answer = answers.find((item) => item.ticket._id === ticket._id);
    if (!answer) {
      return ticket;
    }

    return new TicketModel(
      ticket._id,
      ticket.numberTicket,
      ticket.theme,
      ticket.text,
      ticket.countAnswer + 1,
      answer.status,
    );
  });
}

function printTicket(ticket: TicketModel): void {
  console.log("\n========================");
  console.log(`Билет №${ticket.numberTicket}`);
  console.log(`Тема: ${ticket.theme}`);
  console.log(ticket.text);
  console.log("========================\n");
}
