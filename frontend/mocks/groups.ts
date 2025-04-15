import { Group } from "@/types";
import { mockUsers } from "./users";

export const mockGroups: Group[] = [
  {
    id: "group1",
    name: "Trip to Bali",
    description: "Expenses for our amazing vacation in Bali",
    members: [mockUsers[0], mockUsers[1], mockUsers[2]],
    createdAt: "2023-06-15T10:30:00Z",
    updatedAt: "2023-07-20T14:45:00Z",
    totalBalance: 1250.75,
    coverImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
  },
  {
    id: "group2",
    name: "Apartment Bills",
    description: "Monthly bills and expenses for our apartment",
    members: [mockUsers[0], mockUsers[3], mockUsers[4]],
    createdAt: "2023-01-05T08:15:00Z",
    updatedAt: "2023-07-25T19:20:00Z",
    totalBalance: 325.50,
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
  },
  {
    id: "group3",
    name: "Weekend Getaway",
    description: "Expenses for our weekend trip",
    members: [mockUsers[0], mockUsers[1]],
    createdAt: "2023-07-01T12:00:00Z",
    updatedAt: "2023-07-05T22:10:00Z",
    totalBalance: 450.25,
    coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077",
  },
  {
    id: "group4",
    name: "Dinner Club",
    description: "Monthly dinner outings",
    members: [mockUsers[0], mockUsers[2], mockUsers[3], mockUsers[4]],
    createdAt: "2023-03-10T19:30:00Z",
    updatedAt: "2023-07-15T21:45:00Z",
    totalBalance: 780.00,
    coverImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  },
];