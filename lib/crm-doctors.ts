export const CRM_DOCTORS = [
  {
    slug: "erick-mancilla",
    name: "Dr. Erick Mancilla",
    email: "erick.mancilla@dents23.local",
  },
  {
    slug: "humbelina-huerta",
    name: "Dra. Humbelina Huerta",
    email: "humbelina.huerta@dents23.local",
  },
  {
    slug: "samantha-herrera",
    name: "Dra. Samantha Herrera",
    email: "samantha.herrera@dents23.local",
  },
] as const

export type CrmDoctor = (typeof CRM_DOCTORS)[number]
