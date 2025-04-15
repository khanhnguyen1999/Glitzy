import { ExpenseCategory } from "@/types";
import {
  Utensils,
  Car,
  Home,
  Lightbulb,
  Film,
  ShoppingBag,
  Stethoscope,
  Plane,
  GraduationCap,
  HelpCircle,
} from "lucide-react-native";

export const getCategoryIcon = (category: ExpenseCategory) => {
  switch (category) {
    case "food":
      return Utensils;
    case "transportation":
      return Car;
    case "housing":
      return Home;
    case "utilities":
      return Lightbulb;
    case "entertainment":
      return Film;
    case "shopping":
      return ShoppingBag;
    case "health":
      return Stethoscope;
    case "travel":
      return Plane;
    case "education":
      return GraduationCap;
    case "other":
    default:
      return HelpCircle;
  }
};

export const categoryOptions = [
  { value: "food", label: "Food & Drinks", icon: Utensils },
  { value: "transportation", label: "Transportation", icon: Car },
  { value: "housing", label: "Housing", icon: Home },
  { value: "utilities", label: "Utilities", icon: Lightbulb },
  { value: "entertainment", label: "Entertainment", icon: Film },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "health", label: "Health", icon: Stethoscope },
  { value: "travel", label: "Travel", icon: Plane },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "other", label: "Other", icon: HelpCircle },
];