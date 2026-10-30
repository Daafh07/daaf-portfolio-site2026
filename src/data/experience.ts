// "Work experience": where I have worked (and studied), newest first. The copy is from Figma,
// section "V6 - Na eerste testronde". `current` is the entry shown in white: the others are grey.
export type Entry = {
  period: string;
  title: string;
  place: string;
  body: string;
  tags: string[];
  current?: boolean;
};

export const EXPERIENCE: Entry[] = [
  {
    period: "Aug 2026 - Now",
    title: "Full-Stack Developer",
    place: "mijnlabtest",
    body: "I build and maintain the front and back end of the internal platforms our teams use to communicate and run the day to day. Design and development sit close together here, which is exactly how I like to work.",
    tags: ["React", "Design systems", "API"],
    current: true,
  },
  {
    period: "Aug 2026 - Now",
    title: "Founder",
    place: "InternetNeeds",
    body: "A platform where people post the apps and features the internet is still missing, so developers and companies can pick them up. I designed it, built it and I still run it.",
    tags: ["Product", "Front-end"],
  },
  {
    period: "Aug 2025 - Now",
    title: "ICT, HBO bachelor",
    place: "Fontys",
    body: "Now in my second year, after passing the first year propedeuse with a 10 out of 10.",
    tags: ["ICT", "Second year"],
  },
  {
    period: "Mar 2022 - Now",
    title: "Retail employee to team leader",
    place: "PLUS",
    body: "Started on the floor in March 2022 and was promoted to team leader in November 2025. I run a team, which is where I learned to keep people organised when everything happens at once.",
    tags: ["Team", "Promoted"],
  },
];
