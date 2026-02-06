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

export async function learningModeUseCase(): Promise<void> {
  const ticketRepo = new ticketRepository();
  const historyRepo = new historyRepository();

  const allTickets = ticketRepo.getAll();
  const themes = getUniqueThemes(allTickets);

  const { selectedTheme } = await inquirer.prompt<{ selectedTheme: string }>([
    {
      type: "select",
      name: "selectedTheme",
      message: "Выберите тему для обучения:",
      choices: themes.map((theme) => ({
        name: `${theme} (${countTicketsByTheme(allTickets, theme)} билетов)`,
        value: theme,
        short: theme,
      })),
      pageSize: themes.length,
      loop: false,
    },
  ]);

  const themeTickets = allTickets.filter(
    (ticket) => ticket.theme === selectedTheme,
  );

  console.log(
    `\n📚 Тема: ${selectedTheme}\n📋 Билетов в теме: ${themeTickets.length}\n`,
  );

  const answers: AnswerResult[] = [];

  for (let i = 0; i < themeTickets.length; i++) {
    const ticket = themeTickets[i]!;

    printTicket(ticket, i + 1, themeTickets.length);

    const { action } = await inquirer.prompt<{
      action: "answer" | "skip" | "exit";
    }>([
      {
        type: "select",
        name: "action",
        message: "Что делать?",
        choices: [
          { name: "Ответить на билет", value: "answer", short: "Ответить" },
          { name: "Пропустить", value: "skip", short: "Пропустить" },
          { name: "Выйти из режима обучения", value: "exit", short: "Выход" },
        ],
        pageSize: 3,
        loop: false,
      },
    ]);

    if (action === "exit") {
      console.log("\n👋 Выход из режима обучения.\n");
      break;
    }

    if (action === "skip") {
      console.log("\n⏭️  Билет пропущен.\n");
      continue;
    }

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
    console.log(`\n✅ Ответ записан: ${status}\n`);
  }

  if (answers.length === 0) {
    console.log("\n📭 Вы не ответили ни на один билет.\n");
    return;
  }

  const updatedTickets = updateTicketsAnswers(ticketRepo.getAll(), answers);
  ticketRepo.saveAll(updatedTickets);

  const answeredIds = new Set(answers.map((answer) => answer.ticket._id));
  const answeredTickets = updatedTickets.filter((ticket) =>
    answeredIds.has(ticket._id),
  );
  historyRepo.addEntries(answeredTickets);

  console.log(
    `\n🎉 Обучение завершено! Отвечено на ${answers.length} билет(ов).\n`,
  );
}

function getUniqueThemes(tickets: TicketModel[]): string[] {
  const themesSet = new Set<string>();
  for (const ticket of tickets) {
    themesSet.add(ticket.theme);
  }
  return Array.from(themesSet);
}

function countTicketsByTheme(tickets: TicketModel[], theme: string): number {
  return tickets.filter((ticket) => ticket.theme === theme).length;
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

function printTicket(
  ticket: TicketModel,
  current: number,
  total: number,
): void {
  console.log("\n" + "=".repeat(80));
  console.log(`📍 Билет ${current} из ${total}`);
  console.log(`🎫 Билет №${ticket.numberTicket}`);
  console.log(`📚 Тема: ${ticket.theme}`);
  console.log(`❓ ${ticket.text}`);
  console.log(`📊 Количество ответов: ${ticket.countAnswer}`);
  console.log(`📈 Текущий статус: ${ticket.understandingStatus}`);
  console.log("=".repeat(80));
}
