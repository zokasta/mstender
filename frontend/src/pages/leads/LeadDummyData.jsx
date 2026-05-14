export const initialPipelines = {
  sales: {
    id: "sales",
    name: "Sales Pipeline",

    stages: [
      {
        id: "new",
        name: "New Lead",
        color: "bg-blue-500",
        position: 1,
      },

      {
        id: "contacted",
        name: "Contacted",
        color: "bg-yellow-500",
        position: 2,
      },

      {
        id: "qualified",
        name: "Qualified",
        color: "bg-purple-500",
        position: 3,
      },

      {
        id: "proposal",
        name: "Proposal",
        color: "bg-pink-500",
        position: 4,
      },

      {
        id: "negotiation",
        name: "Negotiation",
        color: "bg-primary-500",
        position: 5,
      },

      {
        id: "closed",
        name: "Closed Won",
        color: "bg-emerald-500",
        position: 6,
      },
    ],
  },
};

export const initialLeads = [
  {
    id: 1,
    pipeline: "sales",
    stage: "new",
    name: "Rahul Sharma",
    company: "TechVision Pvt Ltd",
    value: 125000,
    email: "rahul@techvision.in",
    phone: "+91 98765 43210",
    source: "Website",

    lead_temperature: "Warm",

    quick_followups: [
      {
        id: 1,
        status: "Called",
        description: "Client asked for pricing details",
        created_at: new Date().toLocaleString(),
      },
    ],
  },

  {
    id: 2,
    pipeline: "sales",
    stage: "contacted",
    name: "Priya Patel",
    company: "GreenEnergy Solutions",
    value: 89000,
    email: "priya@greenenergy.co",
    phone: "+91 87654 32109",
    source: "LinkedIn",
    lead_temperature: "Hot",

    quick_followups: [],
  },

  {
    id: 3,
    pipeline: "sales",
    stage: "qualified",
    name: "Amit Kumar",
    company: "BuildCorp India",
    value: 450000,
    email: "amit@buildcorp.in",
    phone: "+91 76543 21098",
    source: "Referral",

    lead_temperature: "Cold",

    quick_followups: [],
  },
];

export const temperatureColors = {
  Hot: "bg-red-100 text-red-600 border-red-200",

  Warm: "bg-yellow-100 text-yellow-700 border-yellow-200",

  Cold: "bg-cyan-100 text-cyan-700 border-cyan-200",
};
