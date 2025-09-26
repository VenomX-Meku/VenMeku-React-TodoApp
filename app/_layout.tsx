     
        //Imports
import { createContext } from "react";

//Task Type
type Task={
 id: string;
 title: string;
 completed: boolean;
 mood: "Urgent"|"Chill" | "Energetic";
 description?: string;
 
};
//App Context Type + Create Context
type AppContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  task: Task[];
  addTask: (task: Task) => void;
  delateTask: (id: string) => void;
  toggleComplet: (id: string) => void;

};
export const AppcCont = createContext<AppContextType | null>(null);
