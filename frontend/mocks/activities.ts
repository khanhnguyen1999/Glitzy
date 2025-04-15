import { Activity } from "@/types";
import { mockExpenses } from "./expenses";
import { mockSettlements } from "./settlements";
import { mockGroups } from "./groups";

export const mockActivities: Activity[] = [
  {
    id: "activity1",
    type: "expense",
    date: "2023-07-20T23:15:00Z",
    data: mockExpenses[4],
    read: false,
  },
  {
    id: "activity2",
    type: "settlement",
    date: "2023-07-20T11:10:00Z",
    data: mockSettlements[3],
    read: false,
  },
  {
    id: "activity3",
    type: "expense",
    date: "2023-07-18T17:30:00Z",
    data: mockExpenses[3],
    read: true,
  },
  {
    id: "activity4",
    type: "settlement",
    date: "2023-07-18T16:20:00Z",
    data: mockSettlements[2],
    read: true,
  },
  {
    id: "activity5",
    type: "expense",
    date: "2023-07-16T09:00:00Z",
    data: mockExpenses[1],
    read: true,
  },
  {
    id: "activity6",
    type: "expense",
    date: "2023-07-15T22:45:00Z",
    data: mockExpenses[0],
    read: true,
  },
  {
    id: "activity7",
    type: "settlement",
    date: "2023-07-15T09:45:00Z",
    data: mockSettlements[1],
    read: true,
  },
  {
    id: "activity8",
    type: "group",
    date: "2023-07-01T12:00:00Z",
    data: mockGroups[2],
    read: true,
  },
];