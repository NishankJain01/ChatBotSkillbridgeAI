
export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  topics: Topic[];
  icon: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UserProgress {
  selectedSkillId: string | null;
  difficulty: Difficulty | null;
  completedTopicIds: string[];
}
