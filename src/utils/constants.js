// ── Shared ─────────────────────────────────────────────────────────────
export const DURATIONS = ['< 5 mins','5–10 mins','10–20 mins','20–30 mins','30–60 mins','1–2 hrs','2+ hrs'];
export const LOCATIONS = ['Home','Work','Public transport','Outdoors','Social setting','Supermarket','Driving','Other'];
export const SLEEP_OPTS = ['Poor','Fair','Good'];
export const MOOD_EMOJIS = ['😔','😞','😐','🙂','😊'];
export const MOOD_LABELS = ['Very low','Low','Neutral','Okay','Good'];
export const COPING = ['Breathing exercises','Grounding (5-4-3-2-1)','Walked away','Called someone','Medication','Cold water','Music','Rest','Distraction','Nothing — rode it out'];

// ── Panic ──────────────────────────────────────────────────────────────
export const PANIC_TRIGGERS = ['Work','Social','Sleep deprived','Caffeine','Alcohol','Financial','Health anxiety','Relationship','Travel','Crowds','Conflict','Unknown'];
export const PANIC_SYMPTOMS = ['Racing heart','Shortness of breath','Dizziness','Chest tightness','Shaking','Sweating','Nausea','Numbness','Hot flush','Fear of losing control','Dissociation'];

// ── Headache ───────────────────────────────────────────────────────────
export const HEADACHE_TYPES = ['Throbbing','Pressure','Sharp','Dull ache','Stabbing','Burning','Squeezing'];
export const HEADACHE_LOCATIONS = ['Forehead','Temples','Back of head','Behind eyes','One side','Top of head','Neck/base','Whole head'];
export const HEADACHE_TRIGGERS = ['Sleep deprived','Dehydrated','Stress','Caffeine','Alcohol','Screen time','Bright light','Strong smell','Skipped meal','Hormonal','Weather change','Unknown'];
export const HEADACHE_SYMPTOMS = ['Nausea','Vomiting','Light sensitivity','Sound sensitivity','Visual aura','Neck stiffness','Facial pain','Dizziness'];

// ── Toothache ──────────────────────────────────────────────────────────
export const TOOTH_TYPES = ['Throbbing','Sharp','Dull ache','Pressure','Sensitivity to hot','Sensitivity to cold','Sensitivity to sweet','Constant','On biting'];
export const TOOTH_LOCATIONS = ['Upper left','Upper right','Upper front','Lower left','Lower right','Lower front','Jaw','Gum','Widespread'];
export const TOOTH_TRIGGERS = ['Hot food/drink','Cold food/drink','Sweets','Biting','Pressure','Spontaneous'];

// ── Illness ────────────────────────────────────────────────────────────
export const ILLNESS_TYPES = ['Cold','Flu','Stomach bug','Infection','Allergy','Virus','Unknown'];
export const ILLNESS_SYMPTOMS = ['Fever','Sore throat','Runny nose','Blocked nose','Cough','Fatigue','Nausea','Vomiting','Diarrhoea','Muscle aches','Headache','Loss of appetite','Chills','Rash','Shortness of breath'];

// ── Pain / Other ───────────────────────────────────────────────────────
export const PAIN_TYPES = ['Throbbing','Sharp','Dull ache','Burning','Stabbing','Cramping','Pressure','Tingling'];
export const PAIN_BODY_LOCATIONS = ['Head','Neck','Shoulder','Upper back','Lower back','Chest','Abdomen','Hip','Knee','Ankle','Arm','Hand','Leg','Foot','Jaw','Other'];

// ── Severity colours ───────────────────────────────────────────────────
export const SEV_COLORS = ['#2dd4a0','#9b7fff','#f5a623','#ff7f5c','#ff6b8a'];
export const SEV_LABELS = ['Mild','Moderate','Notable','Intense','Severe'];

export function sevColor(n) { return SEV_COLORS[(n ?? 1) - 1] ?? SEV_COLORS[0]; }
export function sevLabel(n) { return SEV_LABELS[(n ?? 1) - 1] ?? ''; }
