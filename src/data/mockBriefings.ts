
export interface Briefing {
  id: string;
  title: string;
  taskingName: string;
  createdAt: string;
  summary: string;
}

export const mockBriefings: Briefing[] = [
  {
    id: '1',
    title: 'Q4 Financial Performance Executive Summary',
    taskingName: 'Q4 Financial Review',
    createdAt: '2024-01-15',
    summary: 'Q4 revenue exceeded targets by 12% with strong performance across all business units. Operating margins improved by 3.2% through successful cost optimization initiatives.'
  },
  {
    id: '2',
    title: 'Digital Transformation Strategic Roadmap',
    taskingName: 'Digital Transformation',
    createdAt: '2024-01-12',
    summary: 'Comprehensive 18-month digital transformation plan with phased implementation approach, focusing on cloud migration, process automation, and data analytics capabilities.'
  },
  {
    id: '3',
    title: 'Market Expansion Risk Assessment',
    taskingName: 'Market Expansion',
    createdAt: '2024-01-09',
    summary: 'Asian market expansion shows strong potential with estimated ROI of 25% over 3 years. Key risks identified include regulatory compliance and local partnership requirements.'
  }
];
