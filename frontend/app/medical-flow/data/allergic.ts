import type { FlowGraph } from "../types";

export const allergic: FlowGraph = {
  id: "allergic-reaction",
  title: "Allergic reaction",
  description: "Rash, itching, swelling, or trouble breathing after exposure to something.",
  keywords: ["allergy", "allergic", "reaction", "rash", "hives", "swelling", "itching", "anaphylaxis"],
  version: "0.1.0",
  review: "draft",
  entry: "q_severe",
  sources: [{ label: "Flowchart provided by the project team (translated from Portuguese)" }],
  nodes: {
    q_severe: {
      id: "q_severe",
      type: "question",
      text: "Do you have shortness of breath, low blood pressure, severe abdominal pain, or a feeling of faintness?",
      yes: "d_anaphylaxis",
      no: "q_swelling",
      unsure: "d_anaphylaxis", // when unsure about a red flag, treat it as present
    },
    q_swelling: {
      id: "q_swelling",
      type: "question",
      text: "Do you have localized swelling, such as around the eyes or lips?",
      yes: "d_angioedema",
      no: "q_hives",
      unsure: "d_angioedema",
    },
    q_hives: {
      id: "q_hives",
      type: "question",
      text: "Do you have red, itchy skin lesions on any part of your body?",
      yes: "d_hives",
      no: "d_nonallergic",
      unsure: "d_nonallergic",
    },
    d_anaphylaxis: {
      id: "d_anaphylaxis",
      type: "disposition",
      level: "emergency",
      title: "Possible anaphylaxis in progress",
      instructions: [
        { kind: "action", text: "Stop all activity." },
        { kind: "call", text: "Call the Crew Medical Officer (CMO)." },
        { kind: "action", text: "Stay on oxygen support." },
        { kind: "monitor", text: "Stay under continuous vital signs monitoring." },
        {
          kind: "medication",
          text: "Consider 0.5 mg of epinephrine (adrenaline) by intramuscular injection into the outer thigh muscle (vastus lateralis).",
        },
      ],
    },
    d_angioedema: {
      id: "d_angioedema",
      type: "disposition",
      level: "urgent",
      title: "Localized swelling: call the CMO now",
      instructions: [
        { kind: "action", text: "Stop all activity." },
        { kind: "call", text: "Call the Crew Medical Officer (CMO)." },
        { kind: "lab", text: "Request a complete blood count, kidney function and liver enzymes (transaminases)." },
        { kind: "monitor", text: "Stay under continuous vital signs monitoring." },
        { kind: "medication", text: "Consider intravenous hydrocortisone." },
        { kind: "observe", text: "Keep observing the swelling." },
      ],
    },
    d_hives: {
      id: "d_hives",
      type: "disposition",
      level: "monitor",
      title: "Mild skin reaction: treat and observe",
      instructions: [
        {
          kind: "medication",
          text: "Take 1 tablet of loratadine 10 mg by mouth.",
          warning: "This medication may cause drowsiness.",
        },
        { kind: "observe", text: "Watch how the reaction evolves." },
      ],
    },
    d_nonallergic: {
      id: "d_nonallergic",
      type: "disposition",
      level: "cmo_evaluation",
      title: "Possible non-allergic reaction: call the CMO",
      instructions: [
        { kind: "action", text: "Stay calm." },
        { kind: "call", text: "Call the Crew Medical Officer (CMO) for evaluation." },
      ],
    },
  },
};
