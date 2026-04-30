export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Cv {
  id: string;
  name: string;
  age: number;
  job: string;
  userId: string;
  skillIds: string[];
}

export interface Skill {
  id: string;
  designation: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[]; // List of event types to subscribe to (e.g., CV_CREATED)
}

export const users: User[] = [
  { id: '1', name: 'Aymen', email: 'aymen@gmail.com', role: UserRole.ADMIN },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: UserRole.USER },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: UserRole.USER },
  { id: '4', name: 'test', email: 'test@example.com', role: UserRole.USER }

];

export const skills: Skill[] = [
  { id: '1', designation: 'GraphQL' },
  { id: '2', designation: 'NodeJS' },
  { id: '3', designation: 'React' },
];

export const cvs: Cv[] = [
  {
    id: '12345',
    name: 'FullStack Developer',
    age: 41,
    job: 'Freelancer',
    userId: '1',
    skillIds: ['1', '2'],
  },
  {
    id: '67890',
    name: 'Frontend Junior',
    age: 22,
    job: 'Intern',
    userId: '2',
    skillIds: ['3'],
  },
];

export const webhooks: Webhook[] = [];

export const db = {
  users,
  cvs,
  skills,
  webhooks,
};
