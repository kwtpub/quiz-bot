import inquirer from "inquirer";
import { answersTicketUseCase } from "./use-cases/answers-ticket.use-case.js";
import { statisticUseCase } from "./use-cases/statistic.use-case.js";

type AppAction = "answer" | "stat";

async function main(): Promise<void> {
  const { action } = await inquirer.prompt<{ action: AppAction }>([
    {
      type: "select",
      name: "action",
      message: "Что вы хотите сделать?",
      choices: [
        {
          name: "Ответить на 2 билета",
          value: "answer",
          short: "Ответить",
        },
        {
          name: "Посмотреть статистику",
          value: "stat",
          short: "Статистика",
        },
      ],
      pageSize: 2,
      loop: false,
    },
  ]);

  if (action === "stat") {
    statisticUseCase();
    return;
  }

  await answersTicketUseCase();
}

main().catch((error: unknown) => {
  console.error("Ошибка выполнения:", error);
  process.exitCode = 1;
});
