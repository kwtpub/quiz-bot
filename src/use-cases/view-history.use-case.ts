import { historyRepository } from "../repository/histoty.repository.js";

export function viewHistoryUseCase(): void {
  const repo = new historyRepository();
  const history = repo.getAll();

  if (history.length === 0) {
    console.log("\n📭 История пуста. Вы еще не отвечали на билеты.\n");
    return;
  }

  console.log("\n📜 История ответов на билеты\n");
  console.log("=".repeat(80));

  for (const entry of history) {
    console.log(
      `\n🎫 Билет №${entry.ticket.numberTicket} | Статус: ${entry.quantityAnswer}`,
    );
    console.log(`   Тема: ${entry.ticket.theme}`);
    console.log(`   Текст: ${entry.ticket.text}`);
  }

  console.log("\n" + "=".repeat(80));
  console.log(`\n📊 Всего записей в истории: ${history.length}\n`);
}
