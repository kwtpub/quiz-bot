"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const answers_ticket_use_case_1 = require("./use-cases/answers-ticket.use-case");
const statistic_use_case_1 = require("./use-cases/statistic.use-case");
async function main() {
    const { action } = await inquirer_1.default.prompt([
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
        (0, statistic_use_case_1.statisticUseCase)();
        return;
    }
    await (0, answers_ticket_use_case_1.answersTicketUseCase)();
}
main().catch((error) => {
    console.error("Ошибка выполнения:", error);
    process.exitCode = 1;
});
//# sourceMappingURL=main.js.map