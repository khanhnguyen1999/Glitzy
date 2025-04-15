import { Friend } from "@/types";
import { mockUsers } from "./users";

export const mockFriends: Friend[] = [
  {
    id: "friend1",
    user: mockUsers[1],
    balance: 125.50,
    addedAt: "2023-01-15T10:30:00Z",
  },
  {
    id: "friend2",
    user: mockUsers[2],
    balance: -75.25,
    addedAt: "2023-02-20T14:45:00Z",
  },
  {
    id: "friend3",
    user: mockUsers[3],
    balance: 0,
    addedAt: "2023-03-10T08:15:00Z",
  },
  {
    id: "friend4",
    user: mockUsers[4],
    balance: 250.00,
    addedAt: "2023-04-05T19:20:00Z",
  },
];