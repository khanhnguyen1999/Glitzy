import { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
    preferredCurrency: "USD",
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    preferredCurrency: "USD",
  },
  {
    id: "user3",
    name: "Mike Johnson",
    email: "mike@example.com",
    avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126",
    preferredCurrency: "EUR",
  },
  {
    id: "user4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    preferredCurrency: "GBP",
  },
  {
    id: "user5",
    name: "David Brown",
    email: "david@example.com",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61",
    preferredCurrency: "USD",
  },
];

export const currentUser: User = {
  id: "user1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
  preferredCurrency: "USD",
};