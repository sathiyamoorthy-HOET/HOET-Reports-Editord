// Static reference data drawn from the Editing Team Responsibility Matrix
// and the Video Editing SOP Checklist sheets.

export interface Responsibility {
  scope: "Own Team" | "Entire Team";
  task: string;
  priority?: string;
}

export interface ManagerBlock {
  manager: string;
  role: string;
  items: Responsibility[];
}

export const RESPONSIBILITY_MATRIX: ManagerBlock[] = [
  {
    manager: "Vyshak",
    role: "Video Editing Manager",
    items: [
      { scope: "Own Team", task: "6+ editors performance increase while maintaining output quality" },
      { scope: "Own Team", task: "Take 1:1s for in-house editors" },
      { scope: "Own Team", task: "Incentive structure — Avg video duration (total mins / total people)" },
      { scope: "Entire Team", task: "Onboarding & bandwidth requirements", priority: "P1" },
      { scope: "Entire Team", task: "Solving editors' blockers" },
      { scope: "Entire Team", task: "Overlooking creds & softwares", priority: "P2" },
      { scope: "Entire Team", task: "Interviews for hiring", priority: "P3" },
      { scope: "Entire Team", task: "Profile reviewing", priority: "P3" },
      { scope: "Entire Team", task: "Backup editing" },
    ],
  },
  {
    manager: "Kaustubh",
    role: "Manager — Ads",
    items: [
      { scope: "Own Team", task: "6+ editors performance increase while maintaining output quality", priority: "P1" },
      { scope: "Own Team", task: "Take 1:1s for in-house editors" },
      { scope: "Own Team", task: "Incentive structure — Avg video duration" },
      { scope: "Entire Team", task: "Build assets (with Mukesh)", priority: "P1" },
      { scope: "Entire Team", task: "Create custom training videos", priority: "P2" },
      { scope: "Entire Team", task: "Interviews for hiring", priority: "P2" },
      { scope: "Entire Team", task: "Profile reviewing", priority: "P3" },
      { scope: "Entire Team", task: "Backup editing", priority: "P2" },
    ],
  },
  {
    manager: "Mukesh",
    role: "Manager — Organic",
    items: [
      { scope: "Own Team", task: "6+ editors performance increase while maintaining output quality" },
      { scope: "Own Team", task: "Take 1:1s for in-house editors" },
      { scope: "Own Team", task: "Incentive structure — Avg video duration" },
      { scope: "Entire Team", task: "AI tools experimenting", priority: "P2" },
      { scope: "Entire Team", task: "Weekly training", priority: "P1" },
      { scope: "Entire Team", task: "Build assets (with Kaustubh)", priority: "P3" },
      { scope: "Entire Team", task: "Interviews for hiring", priority: "P3" },
      { scope: "Entire Team", task: "Profile reviewing", priority: "P3" },
      { scope: "Entire Team", task: "Backup editing" },
    ],
  },
  {
    manager: "Sathiya",
    role: "Deputy Manager — Training",
    items: [
      { scope: "Own Team", task: "6+ editors performance increase while maintaining output quality" },
      { scope: "Own Team", task: "Take 1:1s for in-house editors" },
      { scope: "Own Team", task: "Incentive structure — Avg video duration" },
      { scope: "Entire Team", task: "Build training materials", priority: "P1" },
      { scope: "Entire Team", task: "Custom training videos", priority: "P2" },
      { scope: "Entire Team", task: "Interviews for hiring", priority: "P3" },
      { scope: "Entire Team", task: "Profile reviewing", priority: "P3" },
      { scope: "Entire Team", task: "Backup editing", priority: "P2" },
    ],
  },
];

export interface SopSection {
  title: string;
  items: string[];
}

export const SOP_SECTIONS: SopSection[] = [
  {
    title: "Scope & Mapping",
    items: [
      "List every brand under the house (e.g. Be10x + others)",
      "List content types per brand: Ads, Course Videos, YouTube Organic, Shorts, MLE, Podcast/Success Story",
      "Mark shared SOP vs brand-specific variants",
      "Identify pod/editor ownership per brand × content-type",
    ],
  },
  {
    title: "Brand-Level Constants",
    items: [
      "Brand colors, fonts, logo placement & animation rules",
      "Brand voice/tone guideline per brand",
      "Music library / licensed track restrictions",
      "File naming convention (brand_type_date_version)",
      "Folder structure (raw, B-roll, graphics, exports, archive)",
      "Approval chain & sign-off authority per stage",
      "Turnaround time SLA per content type",
    ],
  },
  {
    title: "Editing Workflow Steps",
    items: [
      "Raw footage ingestion & organization",
      "Rough cut / selects pass",
      "Story/structure pass (narrative arc, B-roll pacing)",
      "Graphics/motion pass (lower-thirds, zooms, SFX cues)",
      "Color correction / grading pass",
      "Audio mix & mastering pass",
      "Internal QC pass (checklist-based)",
    ],
  },
  {
    title: "Technical Specs (per content type)",
    items: [
      "Aspect ratio & resolution (9:16, 1:1, 16:9)",
      "Target duration & pacing / cut-rate norms",
      "Platform-safe zones (caption area, thumbnail-safe framing)",
      "Audio loudness standard (LUFS) & dialogue clarity",
      "Subtitle/caption requirement (burned-in vs native)",
      "Required on-screen elements (CTA cards, lower-thirds, chapters)",
    ],
  },
];
