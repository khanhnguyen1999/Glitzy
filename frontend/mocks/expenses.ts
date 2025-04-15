import { Expense } from "@/types";

export const mockExpenses: Expense[] = [
  {
    id: "expense1",
    title: "Dinner at Joe's",
    amount: 120.75,
    currency: "USD",
    paidBy: [
      { userId: "user1", amount: 120.75 }
    ],
    splitBetween: [
      { userId: "user1", amount: 40.25 },
      { userId: "user2", amount: 40.25 },
      { userId: "user3", amount: 40.25 }
    ],
    date: "2023-07-15T19:30:00Z",
    category: "food",
    notes: "Great dinner with friends",
    groupId: "group1",
    createdAt: "2023-07-15T22:45:00Z",
    updatedAt: "2023-07-15T22:45:00Z",
  },
  {
    id: "expense2",
    title: "Taxi to Airport",
    amount: 45.50,
    currency: "USD",
    paidBy: [
      { userId: "user2", amount: 45.50 }
    ],
    splitBetween: [
      { userId: "user1", amount: 22.75 },
      { userId: "user2", amount: 22.75 }
    ],
    date: "2023-07-16T08:15:00Z",
    category: "transportation",
    groupId: "group1",
    createdAt: "2023-07-16T09:00:00Z",
    updatedAt: "2023-07-16T09:00:00Z",
  },
  {
    id: "expense3",
    title: "Electricity Bill",
    amount: 85.30,
    currency: "USD",
    paidBy: [
      { userId: "user1", amount: 85.30 }
    ],
    splitBetween: [
      { userId: "user1", amount: 28.43 },
      { userId: "user4", amount: 28.43 },
      { userId: "user5", amount: 28.44 }
    ],
    date: "2023-07-10T12:00:00Z",
    category: "utilities",
    notes: "July electricity bill",
    groupId: "group2",
    createdAt: "2023-07-10T14:30:00Z",
    updatedAt: "2023-07-10T14:30:00Z",
  },
  {
    id: "expense4",
    title: "Groceries",
    amount: 65.90,
    currency: "USD",
    paidBy: [
      { userId: "user4", amount: 65.90 }
    ],
    splitBetween: [
      { userId: "user1", amount: 21.97 },
      { userId: "user4", amount: 21.97 },
      { userId: "user5", amount: 21.96 }
    ],
    date: "2023-07-18T16:45:00Z",
    category: "food",
    groupId: "group2",
    createdAt: "2023-07-18T17:30:00Z",
    updatedAt: "2023-07-18T17:30:00Z",
  },
  {
    id: "expense5",
    title: "Movie Tickets",
    amount: 36.00,
    currency: "USD",
    paidBy: [
      { userId: "user1", amount: 36.00 }
    ],
    splitBetween: [
      { userId: "user1", amount: 12.00 },
      { userId: "user2", amount: 12.00 },
      { userId: "user3", amount: 12.00 }
    ],
    date: "2023-07-20T20:00:00Z",
    category: "entertainment",
    groupId: "group4",
    createdAt: "2023-07-20T23:15:00Z",
    updatedAt: "2023-07-20T23:15:00Z",
  },
];