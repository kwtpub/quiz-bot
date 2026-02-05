import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { TicketModel } from "../models/ticket.model.js";
export class ticketRepository {
    tickets;
    ticketsPath;
    constructor(tickets, ticketsPath = resolve(process.cwd(), "src/data/tickets.json")) {
        this.ticketsPath = ticketsPath;
        this.tickets = tickets ?? ticketRepository.loadTicketsFromFile(ticketsPath);
    }
    getAll() {
        return [...this.tickets];
    }
    getTwoLeastAnsweredTickets(random = Math.random) {
        return ticketRepository.pickTwoLeastAnswered(this.tickets, random);
    }
    getLeastAnsweredTicketByNumberRange(startNumber, endNumber, random = Math.random) {
        const inRange = this.tickets.filter((ticket) => ticket.numberTicket >= startNumber &&
            ticket.numberTicket <= endNumber);
        return ticketRepository.pickLeastAnswered(inRange, random);
    }
    saveAll(tickets = this.tickets) {
        const data = tickets.map(ticketRepository.toRecord);
        writeFileSync(this.ticketsPath, JSON.stringify(data, null, 2), "utf-8");
        this.tickets = tickets;
    }
    static loadTicketsFromFile(path) {
        const raw = readFileSync(path, "utf-8");
        const data = JSON.parse(raw);
        return data.map((ticket) => new TicketModel(ticket._id, ticket.numberTicket, ticket.theme, ticket.text, ticket.countAnswer, ticket.understandingStatus));
    }
    static toRecord(ticket) {
        return {
            _id: ticket._id,
            numberTicket: ticket.numberTicket,
            theme: ticket.theme,
            text: ticket.text,
            countAnswer: ticket.countAnswer,
            understandingStatus: ticket.understandingStatus,
        };
    }
    static pickTwoLeastAnswered(tickets, random) {
        if (tickets.length === 0) {
            return [];
        }
        const firstTicket = tickets[0];
        if (!firstTicket) {
            return [];
        }
        if (tickets.length === 1) {
            return [firstTicket];
        }
        let minCount = firstTicket.countAnswer;
        for (const ticket of tickets) {
            if (ticket.countAnswer < minCount) {
                minCount = ticket.countAnswer;
            }
        }
        const minTickets = tickets.filter((ticket) => ticket.countAnswer === minCount);
        if (minTickets.length >= 2) {
            return ticketRepository.pickRandomDistinct(minTickets, 2, random);
        }
        const first = minTickets[0];
        if (!first) {
            return [];
        }
        const remaining = tickets.filter((ticket) => ticket.countAnswer > minCount);
        if (remaining.length === 0) {
            return [first];
        }
        const remainingFirst = remaining[0];
        if (!remainingFirst) {
            return [first];
        }
        let secondMin = remainingFirst.countAnswer;
        for (const ticket of remaining) {
            if (ticket.countAnswer < secondMin) {
                secondMin = ticket.countAnswer;
            }
        }
        const secondCandidates = remaining.filter((ticket) => ticket.countAnswer === secondMin);
        const second = ticketRepository.pickRandomDistinct(secondCandidates, 1, random)[0];
        return second ? [first, second] : [first];
    }
    static pickLeastAnswered(tickets, random) {
        if (tickets.length === 0) {
            return null;
        }
        const firstTicket = tickets[0];
        if (!firstTicket) {
            return null;
        }
        let minCount = firstTicket.countAnswer;
        for (const ticket of tickets) {
            if (ticket.countAnswer < minCount) {
                minCount = ticket.countAnswer;
            }
        }
        const candidates = tickets.filter((ticket) => ticket.countAnswer === minCount);
        return (ticketRepository.pickRandomDistinct(candidates, 1, random)[0] ?? null);
    }
    static pickRandomDistinct(items, count, random) {
        if (count <= 0 || items.length === 0) {
            return [];
        }
        const shuffled = items.slice();
        for (let i = shuffled.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
}
