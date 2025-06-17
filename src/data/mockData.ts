
export interface Tasking {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  createdAt: string;
  category: 'personal' | 'shared';
}

export interface Briefing {
  id: string;
  title: string;
  taskingName: string;
  createdAt: string;
  summary: string;
}

export const mockTaskings: Tasking[] = [
  // Personal Taskings
  {
    id: '1',
    name: 'Q4 Financial Review',
    description: 'Comprehensive quarterly financial analysis encompassing revenue performance tracking, detailed cost optimization strategies, comprehensive cash flow evaluation, profitability analysis by business unit, variance reporting against budgets and forecasts, competitive financial benchmarking, strategic financial planning initiatives, risk assessment protocols, and executive-level decision-making support with stakeholder reporting frameworks for board presentations and investor communications.',
    fileCount: 8,
    createdAt: '2024-01-15',
    category: 'personal'
  },
  {
    id: '2',
    name: 'Product Launch Strategy',
    description: 'End-to-end global product launch planning encompassing comprehensive market research and analysis, detailed competitive landscape evaluation, customer segmentation and persona development, go-to-market strategy formulation, dynamic pricing models and revenue optimization, multi-channel distribution strategy, integrated marketing campaign development, sales enablement programs, partnership channel activation, launch timeline coordination, risk mitigation planning, and post-launch performance monitoring frameworks.',
    fileCount: 6,
    createdAt: '2024-01-10',
    category: 'personal'
  },
  {
    id: '3',
    name: 'Digital Transformation',
    description: 'Enterprise-wide digital transformation initiative covering comprehensive technology modernization roadmaps, business process automation and optimization, cloud migration strategy and implementation, advanced data analytics and business intelligence implementation, artificial intelligence and machine learning integration, cybersecurity framework enhancement, organizational change management programs, digital skills development and training, legacy system modernization, vendor management and technology partnerships, and digital culture transformation initiatives.',
    fileCount: 15,
    createdAt: '2024-01-08',
    category: 'personal'
  },
  {
    id: '4',
    name: 'Customer Experience',
    description: 'Customer journey optimization tasking focused on comprehensive touchpoint analysis and mapping, customer satisfaction metrics and NPS improvement, service quality enhancement initiatives, loyalty program development and optimization, omnichannel experience integration, customer feedback loop implementation, personalization strategy development, customer support process optimization, retention strategy formulation, customer lifetime value maximization, and brand experience consistency across all interaction points.',
    fileCount: 9,
    createdAt: '2024-01-05',
    category: 'personal'
  },
  {
    id: '5',
    name: 'Supply Chain Assessment',
    description: 'Global supply chain risk evaluation and optimization including comprehensive vendor assessment and due diligence, logistics efficiency analysis and improvement, advanced inventory management optimization, sustainability practices implementation and ESG compliance, supply chain resilience planning and risk mitigation, cost reduction strategies, quality assurance protocols, technology integration for supply chain visibility, supplier relationship management, geopolitical risk assessment, and business continuity planning.',
    fileCount: 11,
    createdAt: '2024-01-03',
    category: 'personal'
  },
  // Shared Taskings
  {
    id: '6',
    name: 'Talent Strategy',
    description: 'Comprehensive workforce planning initiative covering strategic recruitment optimization and talent acquisition, advanced skill development programs and career pathing, employee retention strategies and engagement initiatives, diversity, equity, and inclusion program development, leadership development and succession planning, performance management system enhancement, compensation and benefits optimization, organizational culture transformation, remote work policy development, and talent analytics and workforce planning.',
    fileCount: 7,
    createdAt: '2024-01-01',
    category: 'shared'
  },
  {
    id: '7',
    name: 'Market Expansion',
    description: 'Strategic market entry analysis for Asian and European markets including comprehensive feasibility studies and market sizing, regulatory compliance and legal framework analysis, cultural adaptation strategies, strategic partnership and joint venture opportunities, localization requirements and implementation, investment planning and financial modeling, competitive landscape analysis, distribution channel development, brand positioning strategies, risk assessment and mitigation planning, and go-to-market timeline development.',
    fileCount: 13,
    createdAt: '2023-12-28',
    category: 'shared'
  },
  {
    id: '8',
    name: 'Sustainability Initiative',
    description: 'Environmental impact assessment and comprehensive ESG compliance program covering carbon footprint reduction strategies, sustainable operations implementation, renewable energy transition planning, waste reduction and circular economy initiatives, regulatory adherence and reporting frameworks, stakeholder engagement strategies, sustainability metrics and KPI development, supply chain sustainability assessment, green technology integration, and corporate social responsibility program development.',
    fileCount: 6,
    createdAt: '2023-12-25',
    category: 'shared'
  },
  {
    id: '9',
    name: 'Security Audit',
    description: 'Comprehensive cybersecurity infrastructure assessment including advanced threat analysis and vulnerability testing, security compliance evaluation against industry standards, incident response planning and disaster recovery protocols, security awareness training and education programs, data protection and privacy compliance, network security architecture review, endpoint security enhancement, identity and access management optimization, security monitoring and detection systems, and cyber risk assessment and mitigation strategies.',
    fileCount: 10,
    createdAt: '2023-12-22',
    category: 'shared'
  },
  {
    id: '10',
    name: 'Innovation Portfolio',
    description: 'Research and development investment review covering comprehensive technology roadmaps and innovation pipeline assessment, intellectual property strategy and patent portfolio management, emerging technology evaluation and adoption planning, innovation partnership and collaboration strategies, startup ecosystem engagement, venture capital and investment evaluation, innovation labs and incubators development, technology transfer and commercialization strategies, innovation metrics and ROI measurement, and future-oriented strategic planning.',
    fileCount: 14,
    createdAt: '2023-12-20',
    category: 'shared'
  }
];

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
