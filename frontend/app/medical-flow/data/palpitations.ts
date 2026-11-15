import type { FlowGraph, Instruction } from "../types";

const LABS: Instruction = {
  kind: "lab",
  text: "Collect: complete blood count, creatinine, urea, sodium, potassium, arterial blood gas, D-dimer and troponin.",
};

export const palpitations: FlowGraph = {
  id: "palpitations-tachycardia",
  title: "Palpitations / fast heart rate",
  description: "Heart rate above 100 bpm or a racing, pounding heartbeat.",
  keywords: ["palpitations", "tachycardia", "heart rate", "racing heart", "heartbeat", "pulse", "fast"],
  version: "0.1.0",
  review: "draft",
  entry: "q_red_flags",
  sources: [{ label: "Flowchart provided by the project team (translated from Portuguese)" }],
  nodes: {
    q_red_flags: {
      id: "q_red_flags",
      type: "question",
      text: "Do you have chest pain, shortness of breath, a feeling of faintness, or sweating?",
      yes: "d_cardiac_workup",
      no: "q_exertion",
      unsure: "d_cardiac_workup", // when unsure about a red flag, treat it as present
    },
    q_exertion: {
      id: "q_exertion",
      type: "question",
      text: "Have you just done any exertion or physical activity?",
      yes: "a_rest",
      no: "q_anxiety",
      unsure: "q_anxiety",
    },
    a_rest: {
      id: "a_rest",
      type: "action",
      title: "Rest, then measure again",
      instructions: [
        { kind: "action", text: "Stay at rest for 15 minutes." },
        { kind: "measure", text: "Measure your heart rate again." },
      ],
      timerMinutes: 15,
      continueLabel: "I have measured again",
      next: "q_recheck",
    },
    q_recheck: {
      id: "q_recheck",
      type: "question",
      text: "Is your heart rate still above 100 bpm, or are the palpitations still present?",
      yes: "q_red_flags", // intentional loop: return to the start of the flowchart
      no: "d_resolved",
      unsure: "q_red_flags",
      loopEdges: ["yes", "unsure"],
    },
    q_anxiety: {
      id: "q_anxiety",
      type: "question",
      text: "Are you anxious, or have you been through emotional stress?",
      yes: "d_anxiety",
      no: "d_unexplained",
      unsure: "d_unexplained",
    },
    d_cardiac_workup: {
      id: "d_cardiac_workup",
      type: "disposition",
      level: "urgent",
      title: "Possible serious cause: call the CMO now",
      instructions: [
        { kind: "action", text: "Stop all activity." },
        { kind: "measure", text: "Measure blood pressure." },
        { kind: "measure", text: "Measure oxygen saturation." },
        { kind: "exam", text: "Perform an electrocardiogram (ECG)." },
        { kind: "call", text: "Call the Crew Medical Officer (CMO)." },
        { kind: "monitor", text: "Stay under continuous vital signs monitoring." },
        LABS,
      ],
    },
    d_resolved: {
      id: "d_resolved",
      type: "disposition",
      level: "monitor",
      title: "Heart rate back to normal",
      instructions: [
        { kind: "observe", text: "Continue normal activities and watch for palpitations returning." },
        { kind: "call", text: "If they return, start this flow again." },
      ],
    },
    d_anxiety: {
      id: "d_anxiety",
      type: "disposition",
      level: "self_care",
      title: "Anxiety or stress as the likely cause",
      instructions: [
        {
          kind: "medication",
          text: "Take lorazepam, 1 tablet by mouth.",
          warning: "This medication may cause drowsiness.",
        },
      ],
    },
    d_unexplained: {
      id: "d_unexplained",
      type: "disposition",
      level: "cmo_evaluation",
      title: "Palpitations without a clear cause: call the CMO",
      instructions: [
        { kind: "call", text: "Call the Crew Medical Officer (CMO)." },
        { kind: "action", text: "Stay at rest." },
        { kind: "monitor", text: "Stay under continuous vital signs monitoring." },
        LABS,
      ],
    },
  },
};
