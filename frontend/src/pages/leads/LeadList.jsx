import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  GripVertical,
  Edit2,
  Trash2,
  Phone,
  MessageCircle,
  Video,
  Plus,
} from "lucide-react";
import Select from "../../components/elements/Select";
import { FaPlus } from "react-icons/fa";
import Input from "../../components/elements/Input";

const initialPipelines = {
  sales: {
    id: "sales",
    name: "Sales Pipeline",
    stages: [
      { id: "new", name: "New Lead", color: "bg-blue-500" },
      { id: "contacted", name: "Contacted", color: "bg-yellow-500" },
      { id: "qualified", name: "Qualified", color: "bg-purple-500" },
      { id: "proposal", name: "Proposal Sent", color: "bg-pink-500" },
      { id: "negotiation", name: "Negotiation", color: "bg-orange-500" },
      { id: "closed", name: "Closed Won", color: "bg-emerald-500" },
    ],
  },
  recruitment: {
    id: "recruitment",
    name: "Recruitment Pipeline",
    stages: [
      { id: "applied", name: "Applied", color: "bg-blue-500" },
      { id: "screening", name: "Screening", color: "bg-yellow-500" },
      { id: "interview", name: "Interview", color: "bg-purple-500" },
      { id: "offer", name: "Offer Sent", color: "bg-pink-500" },
      { id: "hired", name: "Hired", color: "bg-emerald-500" },
    ],
  },
};

const initialLeads = [
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
  },
  {
    id: 4,
    pipeline: "recruitment",
    stage: "applied",
    name: "Sneha Gupta",
    company: "Candidate",
    value: 0,
    email: "sneha.dev@gmail.com",
    phone: "+91 65432 10987",
    source: "Naukri",
  },
];

function App() {
  const [pipelines, setPipelines] = useState(initialPipelines);
  const [leads, setLeads] = useState(initialLeads);
  const [activePipelineId, setActivePipelineId] = useState("sales");
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddStage, setShowAddStage] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const [newLeadData, setNewLeadData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    value: "",
    source: "",
  });
  const [newStageData, setNewStageData] = useState({
    name: "",
    color: "bg-blue-500",
  });

  const activePipeline = pipelines[activePipelineId];
  const pipelineLeads = leads.filter((l) => l.pipeline === activePipelineId);

  const leadsByStage = activePipeline.stages.reduce((acc, stage) => {
    acc[stage.id] = pipelineLeads.filter((lead) => lead.stage === stage.id);
    return acc;
  }, {});

  const onDragEnd = (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id.toString() === draggableId
          ? { ...lead, stage: destination.droppableId }
          : lead
      )
    );
  };

  const addNewLead = () => {
    if (!newLeadData.name || !newLeadData.email) return;

    const newLead = {
      id: Date.now(),
      pipeline: activePipelineId,
      stage: activePipeline.stages[0].id,
      ...newLeadData,
      value: Number(newLeadData.value) || 0,
    };

    setLeads([...leads, newLead]);
    setNewLeadData({
      name: "",
      company: "",
      email: "",
      phone: "",
      value: "",
      source: "",
    });
    setShowAddLead(false);
  };

  const addNewStage = () => {
    if (!newStageData.name) return;

    setPipelines((prev) => ({
      ...prev,
      [activePipelineId]: {
        ...prev[activePipelineId],
        stages: [
          ...prev[activePipelineId].stages,
          {
            id: newStageData.name.toLowerCase().replace(/\s+/g, "-"),
            name: newStageData.name,
            color: newStageData.color,
          },
        ],
      },
    }));

    setNewStageData({ name: "", color: "bg-blue-500" });
    setShowAddStage(false);
  };

  const deleteLead = (id) => {
    setLeads(leads.filter((l) => l.id !== id));
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setNewLeadData({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      value: lead.value,
      source: lead.source,
    });
    setShowAddLead(true);
  };

  const updateLead = () => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === editingLead.id
          ? { ...lead, ...newLeadData, value: Number(newLeadData.value) || 0 }
          : lead
      )
    );
    setShowAddLead(false);
    setEditingLead(null);
    setNewLeadData({
      name: "",
      company: "",
      email: "",
      phone: "",
      value: "",
      source: "",
    });
  };

  const colors = [
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-emerald-500",
    "bg-red-500",
    "bg-cyan-500",
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="h-16 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select
              value={activePipelineId}
              onChange={(e) => setActivePipelineId(e)}
              className="w-[300px]"
            >
              <option value="sales"> --- Select Pipeline --- </option>
              <option value="sales">Sales Pipeline</option>
              <option value="recruitment">Recruitment Pipeline</option>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50 transition"
              onClick={() => setShowAddStage(true)}
            >
              <FaPlus />
              New Status
            </button>

            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md shadow-sm hover:bg-orange-600 transition"
              onClick={() => setShowAddLead(true)}
            >
              <FaPlus />
              New Leads
            </button>
          </div>
        </nav>

        {/* Kanban Board */}
        <div className="overflow-y-none overflow-x-auto mt-4 w-[calc(100dvw-274px)] py-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-cols gap-6">
              {activePipeline.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-w-[300px]"
                >
                  <div
                    className={`px-6 py-5 border-b-4 ${stage.color} flex items-center justify-between sticky top-0 bg-white z-10`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-lg">{stage.name}</h3>
                    </div>
                    <span className="bg-gray-100 px-4 py-1 rounded-2xl text-sm font-medium">
                      {leadsByStage[stage.id]?.length || 0}
                    </span>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 min-h-[75vh] transition-colors ${
                          snapshot.isDraggingOver ? "bg-orange-50" : ""
                        }`}
                      >
                        {leadsByStage[stage.id]?.map((lead, index) => (
                          <Draggable
                            key={lead.id}
                            draggableId={lead.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`lead-card bg-white border border-gray-200 rounded-3xl p-6 mb-4 shadow-sm ${
                                  snapshot.isDragging
                                    ? "scale-105 shadow-2xl"
                                    : ""
                                }`}
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab text-gray-400 hover:text-gray-600"
                                  >
                                    <GripVertical size={24} />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openEditModal(lead)}
                                      className="hover:text-orange-500 text-yellow-500"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                    <button
                                      onClick={() => deleteLead(lead.id)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>

                                <h4 className="text-xl mb-1 text-[#f97316] font-bold">
                                  {lead.name}
                                </h4>
                                <p className="text-gray-600 mb-4">
                                  {lead.company}
                                </p>

                                <div className="space-y-1 text-sm text-gray-600 mb-6">
                                  <p>{lead.email}</p>
                                  <p>{lead.phone}</p>
                                </div>

                                <div className="border-t pt-4 flex justify-between items-end mb-6">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      DEAL VALUE
                                    </p>
                                    <p className="text-xl font-bold text-emerald-600">
                                      ₹{lead.value.toLocaleString("en-IN")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      SOURCE
                                    </p>
                                    <p className="font-medium text-sm">
                                      {lead.source}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <button className="py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl flex flex-col items-center text-xs">
                                    <Phone size={18} /> Call
                                  </button>
                                  <button className="py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl flex flex-col items-center text-xs">
                                    <MessageCircle size={18} /> Msg
                                  </button>
                                  <button className="py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl flex flex-col items-center text-xs">
                                    <Video size={18} /> Meet
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingLead ? "Edit Lead" : "Add New Lead"}
            </h3>
            {/* Form fields same as before */}
            <div className="space-y-5">
              <Input
                type="text"
                placeholder="Full Name"
                value={newLeadData.name}
                onChange={(e) =>
                  setNewLeadData({ ...newLeadData, name: e.target.value })
                }
              />
              <Input
                type="text"
                placeholder="Company"
                value={newLeadData.company}
                onChange={(e) =>
                  setNewLeadData({ ...newLeadData, company: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={newLeadData.email}
                  onChange={(e) =>
                    setNewLeadData({ ...newLeadData, email: e.target.value })
                  }
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={newLeadData.phone}
                  onChange={(e) =>
                    setNewLeadData({ ...newLeadData, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Value"
                  value={newLeadData.value}
                  onChange={(e) =>
                    setNewLeadData({ ...newLeadData, value: e.target.value })
                  }
                />
                <Input
                  type="text"
                  placeholder="Source"
                  value={newLeadData.source}
                  onChange={(e) =>
                    setNewLeadData({ ...newLeadData, source: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowAddLead(false);
                  setEditingLead(null);
                }}
                className="flex-1 py-4 border rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={editingLead ? updateLead : addNewLead}
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl"
              >
                {editingLead ? "Update Lead" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stage Modal */}
      {showAddStage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6">Add New Status</h3>
            <input
              type="text"
              placeholder="Status Name"
              className="w-full px-5 py-4 border rounded-2xl mb-6"
              value={newStageData.name}
              onChange={(e) =>
                setNewStageData({ ...newStageData, name: e.target.value })
              }
            />
            <p className="mb-3 text-sm text-gray-600">Choose Color</p>
            <div className="grid grid-cols-6 gap-3 mb-8">
              {colors.map((c) => (
                <div
                  key={c}
                  onClick={() => setNewStageData({ ...newStageData, color: c })}
                  className={`w-11 h-11 rounded-2xl cursor-pointer ${c} ${
                    newStageData.color === c
                      ? "ring-4 ring-orange-300 scale-110"
                      : ""
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddStage(false)}
                className="flex-1 py-4 border rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={addNewStage}
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl"
              >
                Add Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
