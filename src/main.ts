import inquirer from "inquirer";
import { answersTicketUseCase } from "./use-cases/answers-ticket.use-case.js";
import { statisticUseCase } from "./use-cases/statistic.use-case.js";
import { viewHistoryUseCase } from "./use-cases/view-history.use-case.js";
import { learningModeUseCase } from "./use-cases/learning-mode.use-case.js";

type AppAction = "answer" | "stat" | "history" | "learning";

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
          name: "Режим обучения по теме",
          value: "learning",
          short: "Обучение",
        },
        {
          name: "Посмотреть статистику",
          value: "stat",
          short: "Статистика",
        },
        {
          name: "Посмотреть историю ответов",
          value: "history",
          short: "История",
        },
      ],
      pageSize: 4,
      loop: false,
    },
  ]);

  if (action === "stat") {
    statisticUseCase();
    return;
  }

  if (action === "history") {
    viewHistoryUseCase();
    return;
  }

  if (action === "learning") {
    await learningModeUseCase();
    return;
  }

  await answersTicketUseCase();
}

main().catch((error: unknown) => {
  console.error("Ошибка выполнения:", error);
  process.exitCode = 1;
});
