import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  profile: {
    name: "Papp Niki",
    title: "Ui/Ux Designer",
    bio: "I'm a creative and empathetic person with a background in architecture and a strong passion for UI/UX design. I love solving problems through thoughtful, user-centered design, and I enjoy using tools like Figma to bring ideas to life. In my free time, I like to draw, which keeps my creativity flowing and sharpens my attention to detail.",
    email: "papp.nikolett.eniko@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    skills: ["Figma", "Wireframing", "Design thinking", "User Research", "Prototyping", "English (C1)", "Italian (A2)", "Hungarian (Native)"],
    socials: [
      { platform: "LinkedIn", url: "https://www.linkedin.com/in/nikipapp", iconName: "linkedin" }
    ]
  },
  projects: [
    {
      id: "1",
      title: "UI/UX Design Portfolio",
      description: "A showcase of my user-centered design projects, including wireframes, high-fidelity prototypes, and case studies demonstrating my design thinking process.",
      tags: ["Figma", "UI/UX", "Case Study"],
      imageUrl: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?q=80&w=800&auto=format&fit=crop",
      demoUrl: "#",
      repoUrl: "#"
    }
  ],
  experience: [
    {
      id: "1",
      role: "Support Associate",
      company: "Wolt Hungary",
      period: "2024 - Present",
      description: "I provide real-time support to customers and restaurant partners via chat and email, ensuring a smooth and efficient delivery experience. Maintaining up-to-date knowledge of Wolt’s platform, policies, and service standards to ensure accurate and helpful assistance."
    },
    {
      id: "2",
      role: "Facilities Administrative Assistant",
      company: "PAPPAS KFT",
      period: "2023 - 2025",
      description: "Primarily responsible for managing and organizing facility-related contracts. Supported the facilities team with a wide range of administrative tasks, including maintaining accurate documentation and ensuring proper record keeping."
    },
    {
      id: "3",
      role: "English Teacher",
      company: "Self employed",
      period: "2021 - 2022",
      description: "Provided one-on-one English tutoring for adult learners and students, with a focus on exam preparation."
    }
  ],
  education: [
    {
      id: "1",
      degree: "Architecture",
      institution: "Budapest University of Technology and Economics",
      year: "2022 - 2025",
      description: "Studied Architecture, developing a strong foundation in design principles, structural planning, and attention to detail."
    }
  ],
  certificates: [
    {
      id: "1",
      name: "Google UX Design Professional Certificate",
      issuer: "Google",
      date: "2025",
      url: "#"
    },
    {
      id: "2",
      name: "Figma UI UX Design Essentials",
      issuer: "Udemy",
      date: "2025",
      url: "#"
    }
  ]
};