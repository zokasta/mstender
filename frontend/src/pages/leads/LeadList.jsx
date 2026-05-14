import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  Edit2,
  Trash2,
  Phone,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { FaPlus } from "react-icons/fa";

import Select from "../../components/elements/Select";
import LeadCard from "./LeadCard";
import { temperatureColors } from "./LeadDummyData";
import ViewMode from "./ViewMode";
import Token from "../../database/Token";
import Input from "../../components/elements/Input";
import AddLeadButton from "./AddLeadButton";
import AddNewStageButton from "./AddNewStageButton";

export default function LeadsBoard() {
  const navigate = useNavigate();
  const stageMenuRefs = useRef({});
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();

  const [leads, setLeads] = useState([]);

  const [activePipelineId, setActivePipelineId] = useState("");

  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] = useState("kanban");

  const [showAddLead, setShowAddLead] = useState(false);

  const [showStatusPopup, setShowStatusPopup] = useState(false);

  const [showFollowupModal, setShowFollowupModal] = useState(false);

  const [editingLead, setEditingLead] = useState(null);

  const [selectedLead, setSelectedLead] = useState(null);
  const pipeline_id = params.get("pipeline_id");

  const [followupData, setFollowupData] = useState({
    status: "",
    description: "",
  });

  const [newStageData, setNewStageData] = useState({
    name: "",
    color: "#3b82f6",
    is_default: false,
  });

  const [editingStage, setEditingStage] = useState(null);

  const [openStageMenu, setOpenStageMenu] = useState(null);
  const activePipeline =
    pipelines.find(
      (item) => item.id.toString() === activePipelineId.toString()
    ) || null;

  const pipelineLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesPipeline =
        Number(lead.pipeline_id) === Number(activePipelineId);

      const q = search.toLowerCase();

      const matchesSearch =
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q);

      return matchesPipeline && matchesSearch;
    });
  }, [leads, activePipelineId, search]);

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (activePipelineId) {
      fetchLeads();
    }
  }, [activePipelineId]);

  const fetchPipelines = async () => {
    try {
      const res = await Token.get("/pipelines?status=active");

      const pipelinesData = res.data.data.data || [];

      setPipelines(pipelinesData);

      if (pipelinesData.length > 0) {
        setActivePipelineId(pipelinesData[0].id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const res = await Token.get(`/leads?pipeline_id=${activePipelineId}`);

      setLeads(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const leadsByStage =
    activePipeline?.stages?.reduce((acc, stage) => {
      acc[stage.id] = pipelineLeads.filter(
        (lead) => Number(lead.stage_id) === Number(stage.id)
      );

      return acc;
    }, {}) || {};

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideMenu = Object.values(stageMenuRefs.current).some((ref) =>
        ref?.contains(event.target)
      );

      if (!isInsideMenu) {
        setOpenStageMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedLeads = [...leads];

    const leadIndex = updatedLeads.findIndex(
      (lead) => lead.id.toString() === draggableId
    );

    if (leadIndex === -1) return;

    updatedLeads[leadIndex].stage_id = destination.droppableId;

    setLeads(updatedLeads);

    try {
      await Token.post("/leads/change-stage", {
        lead_id: draggableId,
        stage_id: destination.droppableId,
      });
    } catch (err) {
      console.log(err);

      fetchLeads();
    }
  };

  const resetLeadModal = () => {
    setEditingLead(null);

    setShowAddLead(false);

    // setNewLeadData({
    //   name: "",
    //   company: "",
    //   email: "",
    //   phone: "",
    //   value: "",
    //   source: "",
    // });
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);

    // setNewLeadData({
    //   name: lead.name,
    //   company: lead.company,
    //   email: lead.email,
    //   phone: lead.phone,
    //   value: lead.value,
    //   source: lead.source,
    // });

    setShowAddLead(true);
  };

  const deleteLead = async (id) => {
    try {
      await Token.delete(`/leads/${id}`);

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const addQuickFollowup = async () => {
    try {
      await Token.post("/lead-activities", {
        lead_id: selectedLead.id,

        activity_type: followupData.status,

        description: followupData.description,
      });

      setShowFollowupModal(false);

      setSelectedLead(null);

      setFollowupData({
        status: "",
        description: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateLeadTemperature = async (leadId, temperature) => {
    try {
      await Token.post("/leads/change-priority", {
        lead_id: leadId,

        priority: temperature.toLowerCase(),
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                priority: temperature.toLowerCase(),
              }
            : lead
        )
      );
    } catch (err) {
      console.log(err);
    }
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

    setNewStageData({
      name: "",
      color: "bg-blue-500",
    });
  };

  const saveStage = async () => {
    if (!newStageData.name) return;

    try {
      /*
      |--------------------------------------------------------------------------
      | UPDATE STAGE
      |--------------------------------------------------------------------------
      */

      if (editingStage) {
        const res = await Token.put(`/pipeline-stages/${editingStage.id}`, {
          name: newStageData.name,

          color: newStageData.color,
        });

        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === activePipeline.id
              ? {
                  ...pipeline,

                  stages: pipeline.stages.map((stage) =>
                    stage.id === editingStage.id ? res.data.data : stage
                  ),
                }
              : pipeline
          )
        );
      } else {
        /*
      |--------------------------------------------------------------------------
      | CREATE STAGE
      |--------------------------------------------------------------------------
      */
        const res = await Token.post("/pipeline-stages", {
          pipeline_id: activePipelineId,
          is_default: newStageData.is_default,
          name: newStageData.name,

          color: newStageData.color,

          position: (activePipeline?.stages?.length || 0) + 1,
        });

        setPipelines((prev) =>
          prev.map((pipeline) =>
            pipeline.id === activePipeline.id
              ? {
                  ...pipeline,

                  stages: [...pipeline.stages, res.data.data],
                }
              : pipeline
          )
        );
      }

      setShowStatusPopup(false);

      setEditingStage(null);

      setNewStageData({
        name: "",
        color: "bg-blue-500",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const moveStageLeft = async (stage) => {
    const stages = [...(activePipeline?.stages || [])].sort(
      (a, b) => a.position - b.position
    );

    const currentIndex = stages.findIndex((s) => s.id === stage.id);

    if (currentIndex <= 0) return;

    const leftStage = stages[currentIndex - 1];

    try {
      await Token.put(`/pipeline-stages/${stage.id}`, {
        position: leftStage.position,
      });

      await Token.put(`/pipeline-stages/${leftStage.id}`, {
        position: stage.position,
      });

      fetchPipelines();
    } catch (err) {
      console.log(err);
    }
  };

  const moveStageRight = async (stage) => {
    const stages = [...(activePipeline?.stages || [])].sort(
      (a, b) => a.position - b.position
    );

    const currentIndex = stages.findIndex((s) => s.id === stage.id);

    if (currentIndex >= stages.length - 1) return;

    const rightStage = stages[currentIndex + 1];

    try {
      await Token.put(`/pipeline-stages/${stage.id}`, {
        position: rightStage.position,
      });

      await Token.put(`/pipeline-stages/${rightStage.id}`, {
        position: stage.position,
      });

      fetchPipelines();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteStage = async (stage) => {
    try {
      const hasLeads = leads.some(
        (lead) => Number(lead.stage_id) === Number(stage.id)
      );

      if (hasLeads) {
        alert("Cannot delete stage because it contains leads.");

        return;
      }

      await Token.delete(`/pipeline-stages/${stage.id}`);

      setPipelines((prev) =>
        prev.map((pipeline) =>
          pipeline.id === activePipeline.id
            ? {
                ...pipeline,

                stages: pipeline.stages.filter((s) => s.id !== stage.id),
              }
            : pipeline
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  /* =========================================
   MAIN WRAPPER
========================================= */

  return (
    // <div className="flex flex-col h-full bg-surface-main dark:bg-surface-dark overflow-hidden">
    <div className="flex flex-col h-screen bg-surface-main dark:bg-surface-dark">
      {/* =========================================
       TOP HEADER
    ========================================= */}

      <nav className="h-20 px-6 border-b border-surface-border dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/80 backdrop-blur-xl flex items-center justify-between shrink-0">
        {/* LEFT */}

        <div className="flex items-center gap-4">
          {/* PIPELINE */}

          <div className="min-w-[250px]">
            <Select
              value={activePipelineId}
              onChange={(e) => setActivePipelineId(e)}
            >
              <option value="none" key="none">
                Select Pipeline
              </option>
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </Select>
          </div>

          {/* SEARCH */}

          {/* <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />

            <Input
              value={search}
              onChange={(e) => setSearch(e)}
              placeholder="Search lead..."
              className="w-[280px] h-12 pl-11 pr-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all"
            />
          </div> */}
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-3">
          {/* VIEW MODE */}

          <ViewMode viewMode={viewMode} setViewMode={setViewMode} />

          {/* STATUS */}

        <AddNewStageButton activePipelineId={pipeline_id}/>
          {/* NEW LEAD */}
          <AddLeadButton
            leads={leads}
            setLeads={setLeads}
            pipelines={pipelines}
            pipeline_id={pipeline_id}
          />
        </div>
      </nav>

      {/* =========================================
       BODY
    ========================================= */}

      <div className="flex-1 overflow-auto p-6 scroll-bar">
        {showStatusPopup && (
          <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
            <div className="w-full max-w-xl rounded-[32px] overflow-hidden bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder shadow-2xl">
              {/* HEADER */}

              <div className="px-7 py-6 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                    {editingStage ? "Update Stage" : "Create Stage"}
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure pipeline stage settings
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowStatusPopup(false);

                    setEditingStage(null);
                  }}
                  className="w-11 h-11 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}

              <div className="p-7 space-y-6">
                {/* NAME */}

                <Input
                  label="Stage Name"
                  value={newStageData.name}
                  onChange={(e) =>
                    setNewStageData((prev) => ({
                      ...prev,
                      name: e,
                    }))
                  }
                  placeholder="Enter stage name"
                />

                {/* COLOR */}

                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                    Stage Color
                  </label>

                  <div className="grid grid-cols-4 gap-3">
                    {[
                      "#3b82f6",
                      "#8b5cf6",
                      "#f59e0b",
                      "#ef4444",
                      "#10b981",
                      "#06b6d4",
                      "#ec4899",
                      "#6366f1",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setNewStageData((prev) => ({
                            ...prev,
                            color,
                          }))
                        }
                        className={`h-14 rounded-2xl border-4 transition-all ${
                          newStageData.color === color
                            ? "border-black dark:border-white scale-95"
                            : "border-transparent"
                        }`}
                        style={{
                          background: color,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* DEFAULT */}

                <label className="flex items-center gap-3 p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStageData.is_default}
                    onChange={(e) =>
                      setNewStageData((prev) => ({
                        ...prev,
                        is_default: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 rounded"
                  />

                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      Default Stage
                    </h4>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      New leads will automatically move to this stage
                    </p>
                  </div>
                </label>

                {/* FOOTER */}

                <div className="flex items-center justify-end gap-4 pt-5 border-t border-surface-border dark:border-surface-darkBorder">
                  <button
                    onClick={() => {
                      setShowStatusPopup(false);

                      setEditingStage(null);
                    }}
                    className="h-13 px-7 rounded-2xl border border-surface-border dark:border-surface-darkBorder font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveStage}
                    className="h-13 px-7 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20"
                  >
                    {editingStage ? "Update Stage" : "Create Stage"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[30px] overflow-hidden shadow-sm">
            {/* TABLE HEADER */}

            <div className="grid grid-cols-[70px_260px_200px_130px_150px_130px_140px] bg-surface-soft dark:bg-surface-darkMuted border-b border-surface-border dark:border-surface-darkBorder px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
              <div>ID</div>
              <div>Lead</div>
              <div>Contact</div>
              <div>Stage</div>
              <div>Value</div>
              <div>Temperature</div>
              <div>Actions</div>
            </div>

            {/* TABLE BODY */}

            <div className="divide-y divide-surface-border dark:divide-surface-darkBorder">
              {pipelineLeads.map((lead) => {
                const stage = activePipeline?.stages?.find(
                  (s) => Number(s.id) === Number(lead.stage_id)
                );

                return (
                  <div
                    key={lead.id}
                    className="grid grid-cols-[70px_260px_200px_130px_150px_130px_140px] items-center px-5 py-4 hover:bg-primary-50/60 dark:hover:bg-surface-darkMuted transition-all"
                  >
                    {/* ID */}

                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      #{lead.id}
                    </div>

                    {/* LEAD */}

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center font-bold shrink-0">
                        {lead.name[0]}
                      </div>

                      <div className="min-w-0">
                        <h3
                          onClick={() =>
                            navigate(`/lead/details?id=${lead.id}`)
                          }
                          className="text-sm font-semibold text-gray-800 dark:text-white truncate cursor-pointer hover:text-primary-500"
                        >
                          {lead.name}
                        </h3>

                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {lead.company}
                        </p>
                      </div>
                    </div>

                    {/* CONTACT */}

                    <div className="min-w-0">
                      <p className="text-xs text-gray-700 dark:text-gray-200 truncate">
                        {lead.email}
                      </p>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        {lead.phone}
                      </p>
                    </div>

                    {/* STAGE */}

                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage?.color}`} />

                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stage?.name}
                      </span>
                    </div>

                    {/* VALUE */}

                    <div>
                      <h4 className="text-base font-black text-emerald-600">
                        ₹{Number(lead.value || 0).toLocaleString("en-IN")}
                      </h4>
                    </div>

                    {/* TEMP */}

                    <div>
                      <span
                        className={`text-[10px] px-3 py-1.5 rounded-full border font-semibold ${
                          temperatureColors[lead.lead_temperature]
                        }`}
                      >
                        {lead.lead_temperature}
                      </span>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">
                      <button className="w-9 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 flex items-center justify-center transition-all">
                        <Phone size={14} />
                      </button>

                      <button
                        onClick={() => openEditModal(lead)}
                        className="w-9 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-500 flex items-center justify-center transition-all"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="w-9 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================
         KANBAN VIEW
      ========================================= */}

        {viewMode === "kanban" && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5 h-full">
              {[...(activePipeline?.stages || [])]
                .sort((a, b) => a.position - b.position)
                .map((stage) => {
                  const stageLeads = leadsByStage[stage.id] || [];

                  const total = stageLeads.reduce(
                    (acc, item) => acc + Number(item.value || 0),
                    0
                  );

                  return (
                    <div
                      key={stage.id}
                      className="min-w-[340px] max-w-[340px] h-full bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[30px] flex flex-col shadow-sm"
                    >
                      {/* HEADER */}

                      <div className="p-4 border-b border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted rounded-t-[30px]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-3 h-3 rounded-full ${stage.color}`}
                            />

                            <div className="min-w-0">
                              <h3 className="font-bold text-sm text-gray-800 dark:text-white truncate">
                                {stage.name}
                              </h3>

                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                {stageLeads.length} Leads
                              </p>
                            </div>
                          </div>

                          {/* MENU */}
                          <div
                            className="relative"
                            ref={(el) => {
                              stageMenuRefs.current[stage.id] = el;
                            }}
                          >
                            {/* MENU BUTTON */}

                            <button
                              onClick={() =>
                                setOpenStageMenu(
                                  openStageMenu === stage.id ? null : stage.id
                                )
                              }
                              className="w-9 h-9 rounded-xl hover:bg-white dark:hover:bg-surface-darkCard flex items-center justify-center transition-all"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {/* DROPDOWN */}

                            {openStageMenu === stage.id && (
                              <div className="absolute top-11 right-0 w-52 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard shadow-2xl z-50 overflow-hidden">
                                {/* MOVE LEFT */}

                                <button
                                  onClick={() => {
                                    moveStageLeft(stage);

                                    setOpenStageMenu(null);
                                  }}
                                  className="w-full h-11 px-4 flex items-center gap-3 hover:bg-surface-soft dark:hover:bg-surface-darkMuted text-sm"
                                >
                                  <ChevronLeft size={16} />
                                  Move Left
                                </button>

                                {/* MOVE RIGHT */}

                                <button
                                  onClick={() => {
                                    moveStageRight(stage);

                                    setOpenStageMenu(null);
                                  }}
                                  className="w-full h-11 px-4 flex items-center gap-3 hover:bg-surface-soft dark:hover:bg-surface-darkMuted text-sm"
                                >
                                  <ChevronRight size={16} />
                                  Move Right
                                </button>

                                {/* EDIT */}

                                <button
                                  onClick={() => {
                                    setEditingStage(stage);

                                    setNewStageData({
                                      name: stage.name,

                                      color: stage.color,
                                    });

                                    setShowStatusPopup(true);

                                    setOpenStageMenu(null);
                                  }}
                                  className="w-full h-11 px-4 flex items-center gap-3 hover:bg-surface-soft dark:hover:bg-surface-darkMuted text-sm"
                                >
                                  <Edit2 size={15} />
                                  Edit Stage
                                </button>

                                {/* DELETE */}

                                <button
                                  onClick={() => {
                                    deleteStage(stage);

                                    setOpenStageMenu(null);
                                  }}
                                  className="w-full h-11 px-4 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-sm"
                                >
                                  <Trash2 size={15} />
                                  Delete Stage
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* TOTAL */}

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                              Revenue
                            </p>

                            <h4 className="text-xl font-black text-gray-800 dark:text-white mt-1">
                              ₹{total.toLocaleString("en-IN")}
                            </h4>
                          </div>

                          <div className="h-9 min-w-[38px] px-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center text-xs font-bold">
                            {stageLeads.length}
                          </div>
                        </div>
                      </div>

                      {/* BODY */}

                      <Droppable droppableId={stage.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 min-h-[600px] p-3 overflow-y-auto scroll-bar transition-all ${
                              snapshot.isDraggingOver
                                ? "bg-primary-50/50 dark:bg-primary-900/5"
                                : ""
                            }`}
                          >
                            {stageLeads.map((lead, index) => (
                              <Draggable
                                key={lead.id}
                                draggableId={lead.id.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <LeadCard
                                      snapshot={snapshot}
                                      navigate={navigate}
                                      lead={lead}
                                      openEditModal={openEditModal}
                                      deleteLead={deleteLead}
                                      setSelectedLead={setSelectedLead}
                                      setShowFollowupModal={
                                        setShowFollowupModal
                                      }
                                    />
                                    {/* TOP */}
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
