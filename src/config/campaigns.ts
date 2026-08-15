export interface QuestionOption {
  label: string;
  key: string;
}

export interface QualificationQuestion {
  num: number;
  question: string;
  field: string;
  options: QuestionOption[];
}

export interface CampaignConfig {
  id: string;
  title: string;
  subtitle: string;
  questions: QualificationQuestion[];
}

export const CAMPAIGNS: Record<string, CampaignConfig> = {
  vintexair: {
    id: "vintexair",
    title: "Vintex Air",
    subtitle: "Leading Air & Ventilation Solutions",
    questions: [
      {
        num: 2,
        question: "What type of ventilation/HVAC service do you need? *",
        field: "project_type",
        options: [
          { label: "Commercial Ventilation", key: "A" },
          { label: "Industrial Air Solutions", key: "B" },
          { label: "Residential HVAC", key: "C" },
          { label: "Maintenance & Ducting", key: "D" },
          { label: "Other Custom Solution", key: "E" },
        ],
      },
      {
        num: 3,
        question: "Project location (City & State) *",
        field: "location",
        options: [
          { label: "Mumbai / MH", key: "A" },
          { label: "Delhi NCR / North India", key: "B" },
          { label: "Bangalore / South India", key: "C" },
          { label: "Hyderabad / TS", key: "D" },
          { label: "Other City in India / Global", key: "E" },
        ],
      },
      {
        num: 4,
        question: "Approximate project requirement *",
        field: "requirement",
        options: [
          { label: "Immediate (Within 15 days)", key: "A" },
          { label: "1–3 months", key: "B" },
          { label: "3–6 months", key: "C" },
          { label: "Just exploring", key: "D" },
        ],
      },
    ],
  },
};

export const DEFAULT_CAMPAIGN_ID = "vintexair";

export function getCampaignConfig(campaignId?: string | null): CampaignConfig {
  if (campaignId && CAMPAIGNS[campaignId]) {
    return CAMPAIGNS[campaignId];
  }
  return CAMPAIGNS[DEFAULT_CAMPAIGN_ID];
}
