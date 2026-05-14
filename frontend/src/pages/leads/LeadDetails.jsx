import { useState } from "react";

import {
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock3,
  Activity,
  ChevronRight,
  CheckCircle2,
  Plus,
  MapPin,
  Globe,
  Briefcase,
  Pencil,
  Trash2,
  Edit2,
  X,
  MessageSquare,
  User2,
  Eye,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

export default function LeadDetails() {
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [showLeadModal, setShowLeadModal] = useState(false);

  const [showActivityModal, setShowActivityModal] = useState(false);

  const [showAllActivities, setShowAllActivities] = useState(false);

  const [editingNote, setEditingNote] = useState(null);

  const [activityType, setActivityType] = useState("");

  const [activityData, setActivityData] = useState({
    title: "",
    desc: "",
  });

  const [commentData, setCommentData] = useState({});

  const [lead, setLead] = useState({
    id: 1042,
    name: "Rahul Sharma",
    company: "TechVision Pvt Ltd",
    temperature: "Hot",
    source: "Website",
    email: "rahul@techvision.in",
    phone: "+91 98765 43210",
    website: "www.techvision.in",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    pincode: "380051",
    address: "SG Highway, Ahmedabad",
    value: 450000,
    pipeline: "Sales Pipeline",
    stage: "Proposal",
    assigned_to: "Faiz Rajput",
    created_at: "12 May 2026",
    followup_date: "15 May 2026",
    description:
      "Interested in enterprise ERP and CRM solution with inventory management and HR module.",
  });

  const [leadForm, setLeadForm] = useState(lead);

  const [noteData, setNoteData] = useState({
    title: "",
    desc: "",
  });

  const [notes, setNotes] = useState([
    {
      id: 1,
      title: "Inventory Module",
      desc: "Client wants barcode inventory system with QR integration and warehouse tracking system.",
      time: "2 days ago",
      by: "Faiz",
      comments: [
        {
          id: 1,
          user: "Manager",
          message: "Need pricing approval first.",
        },
      ],
    },

    {
      id: 2,
      title: "Budget Approved",
      desc: "Client approved estimated ERP implementation budget.",
      time: "5 days ago",
      by: "Admin",
      comments: [
        {
          id: 1,
          user: "Sales Head",
          message: "Prepare proposal ASAP.",
        },
      ],
    },
  ]);

  const [activities, setActivities] = useState([
    {
      type: "call",
      title: "Call Completed",
      desc: "Discussed ERP modules and pricing",
      time: "Yesterday",
    },

    {
      type: "whatsapp",
      title: "WhatsApp Followup",
      desc: "Shared quotation PDF",
      time: "2 hours ago",
    },

    {
      type: "meeting",
      title: "Office Visit",
      desc: "Visited client office for demo",
      time: "2 days ago",
    },

    {
      type: "email",
      title: "Proposal Sent",
      desc: "Enterprise proposal shared",
      time: "3 days ago",
    },
  ]);

  const calls = [
    {
      name: "Rahul Sharma",
      duration: "12 min",
      type: "Outgoing",
      time: "11:30 AM",
    },

    {
      name: "Rahul Sharma",
      duration: "6 min",
      type: "Incoming",
      time: "Yesterday",
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "call":
        return <Phone size={14} className="text-blue-500" />;

      case "whatsapp":
        return <FaWhatsapp size={14} className="text-green-500" />;

      case "meeting":
        return <Building2 size={14} className="text-purple-500" />;

      case "email":
        return <Mail size={14} className="text-yellow-500" />;

      default:
        return <Activity size={14} className="text-primary-500" />;
    }
  };

  const openActivityModal = (type) => {
    setActivityType(type);

    setShowActivityModal(true);

    setActivityData({
      title: "",
      desc: "",
    });
  };

  const saveActivity = () => {
    if (!activityData.desc) return;

    setActivities((prev) => [
      {
        type: activityType,

        title: activityData.title || `${activityType} Activity`,

        desc: activityData.desc,

        time: "Just now",
      },

      ...prev,
    ]);

    setShowActivityModal(false);
  };

  const saveNote = () => {
    if (!noteData.title) return;

    if (editingNote) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingNote.id
            ? {
                ...note,
                ...noteData,
              }
            : note
        )
      );
    } else {
      setNotes((prev) => [
        {
          id: Date.now(),

          ...noteData,

          by: "Faiz",

          time: "Just now",

          comments: [],
        },

        ...prev,
      ]);
    }

    setShowNoteModal(false);

    setEditingNote(null);

    setNoteData({
      title: "",
      desc: "",
    });
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const openEditNote = (note) => {
    setEditingNote(note);

    setNoteData({
      title: note.title,
      desc: note.desc,
    });

    setShowNoteModal(true);
  };

  const addComment = (noteId) => {
    if (!commentData[noteId]) return;

    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,

            comments: [
              ...note.comments,

              {
                id: Date.now(),

                user: "Faiz",

                message: commentData[noteId],
              },
            ],
          };
        }

        return note;
      })
    );

    setCommentData({
      ...commentData,
      [noteId]: "",
    });
  };

  const updateLeadInfo = () => {
    setLead(leadForm);

    setShowLeadModal(false);
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Dashboard</span>

            <ChevronRight size={13} />

            <span>Leads</span>

            <ChevronRight size={13} />

            <span className="text-primary-500 font-medium">Lead Details</span>
          </div>

          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Lead Details</h1>
        </div>
      </div>

      {/* TOP */}

      <div className="bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder rounded-xl p-4">
        <div className="flex items-start justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-3xl font-black shrink-0">
              {lead.name[0]}
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-800 dark:text-white">{lead.name}</h2>

              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <Building2 size={14} />

                {lead.company}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-xs font-semibold">
                  {lead.stage}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lead.temperature === "Hot"
                      ? "bg-red-100 text-red-600"
                      : lead.temperature === "Warm"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-cyan-100 text-cyan-700"
                  }`}
                >
                  {lead.temperature}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Phone size={16} />
                </button>

                <button className="w-10 h-10 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Mail size={16} />
                </button>

                <button className="w-10 h-10 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center">
                  <FaWhatsapp size={17} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[360px]">
            <div className="bg-primary-50 rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Deal Value</p>

              <h3 className="text-lg font-bold text-primary-600 mt-1">
                ₹{lead.value.toLocaleString("en-IN")}
              </h3>
            </div>

            <div className="bg-surface-soft dark:bg-surface-darkSoft rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Pipeline</p>

              <h3 className="text-sm font-bold text-gray-800 dark:text-white mt-1">
                {lead.pipeline}
              </h3>
            </div>

            <div className="bg-surface-soft dark:bg-surface-darkSoft rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Assigned To</p>

              <h3 className="text-sm font-bold text-gray-800 dark:text-white mt-1">
                {lead.assigned_to}
              </h3>
            </div>

            <div className="bg-surface-soft dark:bg-surface-darkSoft rounded-xl p-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Follow Up</p>

              <h3 className="text-sm font-bold text-gray-800 dark:text-white mt-1">
                {lead.followup_date}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}

      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* LEFT */}

        <div className="col-span-8 space-y-4">
          {/* LEAD INFO */}

          <div className="bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder rounded-xl">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Lead Information
              </h3>

              <button
                onClick={() => setShowLeadModal(true)}
                className="h-9 px-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm"
              >
                Edit Info
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: <Mail size={15} />,
                    label: "Email",
                    value: lead.email,
                  },

                  {
                    icon: <Phone size={15} />,
                    label: "Phone",
                    value: lead.phone,
                  },

                  {
                    icon: <Globe size={15} />,
                    label: "Website",
                    value: lead.website,
                  },

                  {
                    icon: <Building2 size={15} />,
                    label: "Company",
                    value: lead.company,
                  },

                  {
                    icon: <MapPin size={15} />,
                    label: "City",
                    value: lead.city,
                  },

                  {
                    icon: <MapPin size={15} />,
                    label: "State",
                    value: lead.state,
                  },

                  {
                    icon: <MapPin size={15} />,
                    label: "Country",
                    value: lead.country,
                  },

                  {
                    icon: <MapPin size={15} />,
                    label: "Pincode",
                    value: lead.pincode,
                  },

                  {
                    icon: <Briefcase size={15} />,
                    label: "Source",
                    value: lead.source,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-surface-soft dark:bg-surface-darkSoft rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                      {item.icon}

                      {item.label}
                    </div>

                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mt-2 break-all">
                      {item.value}
                    </h3>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-surface-soft dark:bg-surface-darkSoft rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Description</p>

                <p className="text-sm text-gray-700 leading-7">
                  {lead.description}
                </p>
              </div>
            </div>
          </div>

          {/* ACTIVITIES */}

          <div className="bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder rounded-xl">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Activities</h3>

              <button
                onClick={() => setShowAllActivities(!showAllActivities)}
                className="text-primary-500 text-sm font-semibold flex items-center gap-2"
              >
                <Eye size={14} />

                {showAllActivities ? "Hide" : "View All"}
              </button>
            </div>

            <div className="p-4">
              <div className="relative pl-7">
                <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gray-200" />

                {(showAllActivities ? activities : activities.slice(0, 3)).map(
                  (item, index) => (
                    <div key={index} className="relative mb-5">
                      <div className="absolute -left-[24px] top-1 w-4 h-4 rounded-full bg-primary-500 border-4 border-white" />

                      <div className="bg-surface-soft dark:bg-surface-darkSoft rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder flex items-center justify-center">
                              {getActivityIcon(item.type)}
                            </div>

                            <h4 className="font-semibold text-sm text-gray-800 dark:text-white">
                              {item.title}
                            </h4>
                          </div>

                          <span className="text-[11px] text-gray-400">
                            {item.time}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* NOTES */}

          <div className="bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder rounded-xl">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Notes</h3>

              <button
                onClick={() => setShowNoteModal(true)}
                className="h-9 px-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm"
              >
                Add Note
              </button>
            </div>

            <div className="p-4 space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border border-gray-200 dark:border-surface-darkBorder rounded-xl overflow-hidden"
                >
                  <div className="bg-surface-soft dark:bg-surface-darkSoft p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 dark:text-white">
                          {note.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <CheckCircle2
                            size={13}
                            className="text-emerald-500"
                          />
                          By {note.by}• {note.time}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditNote(note)}
                          className="w-8 h-8 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 flex items-center justify-center"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => deleteNote(note.id)}
                          className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4 leading-7">
                      {note.desc}
                    </p>
                  </div>

                  {/* COMMENTS */}

                  <div className="p-4 bg-white dark:bg-surface-darkCard">
                    <div className="space-y-3">
                      {note.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-surface-soft dark:bg-surface-darkSoft rounded-xl p-3 border border-gray-100"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-primary-500">
                            <User2 size={13} />

                            {comment.user}
                          </div>

                          <p className="text-xs text-gray-600 mt-2 leading-6">
                            {comment.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* COMMENT INPUT */}

                    <div className="flex gap-2 mt-4">
                      <input
                        placeholder="Write comment..."
                        value={commentData[note.id] || ""}
                        onChange={(e) =>
                          setCommentData({
                            ...commentData,
                            [note.id]: e.target.value,
                          })
                        }
                        className="flex-1 h-10 rounded-xl border border-gray-200 dark:border-surface-darkBorder px-4 text-sm outline-none focus:border-primary-300"
                      />

                      <button
                        onClick={() => addComment(note.id)}
                        className="h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm flex items-center gap-2"
                      >
                        <MessageSquare size={14} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="col-span-4">
          <div className="sticky top-5 space-y-4">
            {/* QUICK ACTIONS */}

            <div className="bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder rounded-xl p-4">
              <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
                Quick Actions
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openActivityModal("call")}
                  className="h-10 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 flex items-center justify-center gap-2 text-sm"
                >
                  <Phone size={15} />
                  Call
                </button>

                <button
                  onClick={() => openActivityModal("email")}
                  className="h-10 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 flex items-center justify-center gap-2 text-sm"
                >
                  <Mail size={15} />
                  Email
                </button>

                <button
                  onClick={() => openActivityModal("whatsapp")}
                  className="h-10 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center gap-2 text-sm"
                >
                  <FaWhatsapp size={15} />
                  WhatsApp
                </button>

                <button
                  onClick={() => openActivityModal("meeting")}
                  className="h-10 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center gap-2 text-sm"
                >
                  <Plus size={15} />
                  Followup
                </button>
              </div>
            </div>

            {/* CALLS */}

            <div className="bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder rounded-xl">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800 dark:text-white">Calls</h3>

                <button className="text-primary-500 text-xs font-semibold">
                  View All
                </button>
              </div>

              <div className="p-4 space-y-3">
                {calls.map((call, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-xl bg-surface-soft dark:bg-surface-darkSoft border border-gray-100"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                        <Phone size={15} />
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-gray-800 dark:text-white">
                          {call.name}
                        </h4>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {call.type}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
                          <Clock3 size={12} />

                          {call.time}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-primary-500">
                      {call.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY */}

            <div className="bg-white dark:bg-surface-darkCard border border-gray-200 dark:border-surface-darkBorder rounded-xl p-4">
              <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
                Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Lead ID</span>

                  <span className="font-semibold text-sm text-gray-800 dark:text-white">
                    #{lead.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>

                  <span className="font-semibold text-sm text-gray-800 dark:text-white">
                    {lead.created_at}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Stage</span>

                  <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-xs font-semibold">
                  {lead.stage}
                </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lead.temperature === "Hot"
                        ? "bg-red-100 text-red-600"
                        : lead.temperature === "Warm"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-cyan-100 text-cyan-700"
                    }`}
                  >
                    {lead.temperature}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Source</span>

                  <span className="font-semibold text-sm text-gray-800 dark:text-white">
                    {lead.source}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Assigned To</span>

                  <span className="font-semibold text-sm text-gray-800 dark:text-white">
                    {lead.assigned_to}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY MODAL */}

      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white dark:bg-surface-darkCard rounded-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                Add {activityType} Activity
              </h3>

              <button
                onClick={() => setShowActivityModal(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Activity Title"
                value={activityData.title}
                onChange={(e) =>
                  setActivityData({
                    ...activityData,
                    title: e.target.value,
                  })
                }
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-surface-darkBorder px-4 outline-none focus:border-primary-300"
              />

              <textarea
                placeholder="Write activity details..."
                value={activityData.desc}
                onChange={(e) =>
                  setActivityData({
                    ...activityData,
                    desc: e.target.value,
                  })
                }
                className="w-full h-32 rounded-xl border border-gray-200 dark:border-surface-darkBorder px-4 py-3 outline-none resize-none focus:border-primary-300"
              />

              <div className="bg-surface-soft dark:bg-surface-darkSoft border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Timestamp</p>

                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mt-2">
                  {new Date().toLocaleString()}
                </h4>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-surface-darkBorder hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={saveActivity}
                className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm"
              >
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTE MODAL */}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white dark:bg-surface-darkCard rounded-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingNote ? "Update Note" : "Add Note"}
              </h3>

              <button
                onClick={() => {
                  setShowNoteModal(false);

                  setEditingNote(null);
                }}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Note Title"
                value={noteData.title}
                onChange={(e) =>
                  setNoteData({
                    ...noteData,
                    title: e.target.value,
                  })
                }
                className="w-full h-11 rounded-xl border border-gray-200 dark:border-surface-darkBorder px-4 outline-none focus:border-primary-300"
              />

              <textarea
                placeholder="Write note..."
                value={noteData.desc}
                onChange={(e) =>
                  setNoteData({
                    ...noteData,
                    desc: e.target.value,
                  })
                }
                className="w-full h-32 rounded-xl border border-gray-200 dark:border-surface-darkBorder px-4 py-3 outline-none resize-none focus:border-primary-300"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-surface-darkBorder hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={saveNote}
                className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
