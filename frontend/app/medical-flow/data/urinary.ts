import type { FlowGraph } from "../types";

export const urinary: FlowGraph = {
  id: "urinary-changes",
  title: "Changes in urine",
  description: "Burning, frequency, odor, color changes or lower abdominal pain when urinating.",
  keywords: ["urine", "urinary", "urination", "burning", "uti", "infection", "bladder", "pee"],
  version: "0.1.0",
  review: "draft",
  entry: "q_symptoms",
  sources: [{ label: "Flowchart provided by the project team (translated from Portuguese)" }],
  nodes: {
    q_symptoms: {
      id: "q_symptoms",
      type: "question",
      text: "Do you have burning when urinating, urinating more often, foul-smelling urine, a different urine color, or pain above the pubic bone when urinating?",
      yes: "d_treat",
      no: "d_workup",
      unsure: "d_workup", // when unsure, take the more cautious path
    },
    d_treat: {
      id: "d_treat",
      type: "disposition",
      level: "monitor",
      title: "Possible urinary infection: treat and monitor",
      instructions: [
        { kind: "action", text: "Increase how much you drink by mouth." },
        {
          kind: "medication",
          text: "Take sulfamethoxazole-trimethoprim, 1 tablet of 800 + 160 mg, every 12 hours for 5 days.",
        },
      ],
    },
    d_workup: {
      id: "d_workup",
      type: "disposition",
      level: "cmo_evaluation",
      title: "Urine changes without typical symptoms: call the CMO",
      instructions: [
        { kind: "action", text: "Increase how much you drink by mouth." },
        { kind: "lab", text: "Collect a urinalysis (urine type I)." },
        { kind: "exam", text: "Perform an ultrasound of the kidneys and urinary tract." },
        { kind: "call", text: "Call the Crew Medical Officer (CMO)." },
      ],
    },
  },
};
