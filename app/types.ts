export interface Project {
  id: string;
  title: string;
  description: string;
  deliverables: {
    [phase: string]: string[];
  };
  createdAt: string;
} 