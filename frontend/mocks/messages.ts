import { Message } from "@/types";

export const mockMessages: Message[] = [
  {
    id: "message1",
    groupId: "group1",
    senderId: "user2",
    text: "Hey everyone! I just added the dinner expense from last night.",
    timestamp: "2023-07-15T22:50:00Z",
  },
  {
    id: "message2",
    groupId: "group1",
    senderId: "user3",
    text: "Thanks for adding that! I'll settle up next week.",
    timestamp: "2023-07-15T23:05:00Z",
  },
  {
    id: "message3",
    groupId: "group1",
    senderId: "user1",
    text: "No rush, just whenever you can.",
    timestamp: "2023-07-15T23:10:00Z",
  },
  {
    id: "message4",
    groupId: "group2",
    senderId: "user4",
    text: "I paid the electricity bill today, added it to our expenses.",
    timestamp: "2023-07-10T14:35:00Z",
  },
  {
    id: "message5",
    groupId: "group2",
    senderId: "user1",
    text: "Thanks! I'll transfer my share this weekend.",
    timestamp: "2023-07-10T15:00:00Z",
  },
  {
    id: "message6",
    groupId: "group2",
    senderId: "user5",
    text: "Me too, thanks for taking care of it @user4",
    timestamp: "2023-07-10T15:30:00Z",
    mentions: ["user4"],
  },
];