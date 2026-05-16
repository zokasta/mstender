import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  Edit2,
  Trash2,
  Phone,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import LeadCard from "./LeadCard";
import { temperatureColors } from "./LeadDummyData";
import ViewMode from "./ViewMode";
import Token from "../../database/Token";
import Input from "../../components/elements/Input";
import AddLeadButton from "./AddLeadButton";
import AddNewStageButton from "./AddNewStageButton";
import SelectSearch from "../../components/elements/SelectSearch";
import { FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Textarea from "../../components/elements/Textarea";
import { createPortal } from "react-dom";
import Select from "../../components/elements/Select";

export default function LeadList() {
  const navigate = useNavigate();
  const stageMenuRefs = useRef({});
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState({
    lead: { delete: false, edit: false },
  });
  const [params] = useSearchParams();

  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("kanban");
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const pipeline_id = params.get("pipeline_id");
  const [showAddLead, setShowAddLead] = useState(false);

  const [editingLead, setEditingLead] = useState(null);
  const [followupData, setFollowupData] = useState({
    activity_type: "followup",
    description: "",
    outcome: "",
    next_action: "",
    next_followup_at: "",
  });

  const [followupLoading, setFollowupLoading] = useState(false);

  const [newStageData, setNewStageData] = useState({
    name: "",
    color: "#3b82f6",
    is_default: false,
  });

  const [editingStage, setEditingStage] = useState(null);

  const [openStageMenu, setOpenStageMenu] = useState(null);
  const activePipeline =
    pipelines.find((item) => String(item.id) === String(pipeline_id || "")) ||
    null;

  const pipelineLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesPipeline = Number(lead.pipeline_id) === Number(pipeline_id);

      const q = search.toLowerCase();

      const matchesSearch =
        lead.name.toLowerCase().includes(q) ||
        lead.company.toLowerCase().includes(q);

      return matchesPipeline && matchesSearch;
    });
  }, [leads, pipeline_id, search]);

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (pipeline_id) {
      fetchLeads();
    }
  }, [pipeline_id]);

  const fetchPipelines = async () => {
    if (pipeline_id) {
    }
    try {
      const res = await Token.get("/pipelines?status=active");

      const pipelinesData = res.data.data.data || [];

      setPipelines(pipelinesData);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      if (!pipeline_id) {
        return;
      }

      const res = await Token.get(`/leads?pipeline_id=${pipeline_id}`);

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

  const openEditModal = (lead) => {
    setEditingLead(lead);
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
    setFollowupLoading(true);
    try {
      await Token.post("/lead-activities", {
        lead_id: selectedLead.id,

        activity_type: followupData.activity_type,
        outcome: followupData.outcome,
        next_action: followupData.next_action,
        next_followup_at: followupData.next_followup_at,
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
    } finally {
      setFollowupLoading(false);
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
          pipeline_id: pipeline_id,
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

      <nav className="relative z-[20] h-20 px-6 border-b border-surface-border dark:border-surface-darkBorder bg-white/80 dark:bg-surface-darkCard/80 backdrop-blur-xl flex items-center justify-between shrink-0">
        {/* LEFT */}

        <div className="flex items-center gap-4">
          {/* PIPELINE */}

          <div className="min-w-[250px]">
            {/* <Select
              value={pipeline_id}
              onChange={(e) => {
                navigate(`/leads?pipeline_id=${e}`);
              }}
            >
              <option value="none" key="none">
                Select Pipeline
              </option>
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </Select> */}
            <SelectSearch
              api="/pipelines?status=active"
              method="get"
              value={pipeline_id}
              searchKey="name"
              placeholder="Select Lead Set"
              onChange={(e) => navigate(`/leads?pipeline_id=${e}`)}
              labelKey="name"
            />
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

          <AddNewStageButton activePipelineId={pipeline_id} />
          {/* NEW LEAD */}
          <AddLeadButton
            setLeads={setLeads}
            pipelines={pipelines}
            pipeline_id={pipeline_id}
            showAddLead={showAddLead}
            setShowAddLead={setShowAddLead}
            editingLead={editingLead}
            setEditingLead={setEditingLead}
          />
        </div>
      </nav>

      {/* =========================================
       BODY
    ========================================= */}

      {showFollowupModal &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-md">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-[50vw] h-[80vh] rounded-[32px] overflow-hidden border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard shadow-2xl flex flex-col">
                {/* =====================================================
              HEADER
          ===================================================== */}

                <div className="shrink-0 px-8 py-6 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white">
                      Quick Followup
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Create activity for {selectedLead?.name}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowFollowupModal(false)}
                    className="w-12 h-12 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-all text-xl dark:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                {/* =====================================================
              BODY
          ===================================================== */}

                <div className="flex-1 overflow-y-auto scroll-bar p-8">
                  {/* ACTIVITY */}

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
                      Activity Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Activity Type
                        </label>

                        <Select
                          value={followupData.activity_type}
                          onChange={(e) =>
                            setFollowupData((prev) => ({
                              ...prev,
                              activity_type: e,
                            }))
                          }
                        >
                          <option value="followup">Followup</option>
                          <option value="call">Call</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="meeting">Meeting</option>
                          <option value="task">Task</option>
                          <option value="note">Note</option>
                        </Select>
                      </div>

                      <Input
                        label="Outcome"
                        value={followupData.outcome}
                        onChange={(v) =>
                          setFollowupData((prev) => ({
                            ...prev,
                            outcome: v,
                          }))
                        }
                        placeholder="Connected / Interested"
                      />
                    </div>
                  </div>

                  {/* FOLLOWUP */}

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
                      Schedule
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Next Action"
                        value={followupData.next_action}
                        onChange={(v) =>
                          setFollowupData((prev) => ({
                            ...prev,
                            next_action: v,
                          }))
                        }
                        placeholder="Call tomorrow"
                      />

                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Next Followup Time
                        </label>

                        <input
                          type="datetime-local"
                          value={followupData.next_followup_at}
                          onChange={(e) =>
                            setFollowupData((prev) => ({
                              ...prev,
                              next_followup_at: e.target.value,
                            }))
                          }
                          className="w-full rounded-3xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted px-5 py-3 outline-none dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* NOTES */}

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
                      Notes
                    </h3>

                    <Textarea
                      value={followupData.description}
                      onChange={(v) =>
                        setFollowupData((prev) => ({
                          ...prev,
                          description: v,
                        }))
                      }
                      rows={8}
                      placeholder="Write followup details..."
                    />
                  </div>
                </div>

                {/* =====================================================
              FOOTER
          ===================================================== */}

                <div className="shrink-0 px-8 py-5 border-t border-surface-border dark:border-surface-darkBorder flex items-center justify-end gap-4">
                  <button
                    onClick={() => setShowFollowupModal(false)}
                    className="h-14 px-8 rounded-2xl border dark:text-gray-300 border-surface-border dark:border-surface-darkBorder hover:bg-surface-soft dark:hover:bg-surface-darkMuted font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={addQuickFollowup}
                    disabled={followupLoading}
                    className="h-14 min-w-[180px] px-8 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50"
                  >
                    {followupLoading ? "Saving..." : "Save Followup"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

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

            <div className="grid grid-cols-[70px_260px_200px_130px_150px_130px_200px] bg-surface-soft dark:bg-surface-darkMuted border-b border-surface-border dark:border-surface-darkBorder px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
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
                    className="grid overflow-y-auto grid-cols-[70px_260px_200px_130px_150px_130px_200px] items-center px-5 py-4 hover:bg-primary-50/60 dark:hover:bg-surface-darkMuted transition-all"
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
                          temperatureColors[lead.status]
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2">
                      <Link to={`tel:${lead.phone}`}>
                        <button className="w-9 dark:text-gray-300 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 flex items-center justify-center transition-all">
                          <Phone size={14} />
                        </button>
                      </Link>
                      <Link to={`tel:${lead.phone}`}>
                        <button className="w-9 dark:text-gray-300 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 flex items-center justify-center transition-all">
                          <FaWhatsapp size={14} />
                        </button>
                      </Link>
                      <Link to={`tel:${lead.phone}`}>
                        <button className="w-9 dark:text-gray-300 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 flex items-center justify-center transition-all">
                          <MdEmail size={14} />
                        </button>
                      </Link>

                      <button
                        onClick={() => openEditModal(lead)}
                        className="w-9 dark:text-gray-300 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-500 flex items-center justify-center transition-all"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        onClick={() => deleteLead(lead.id)}
                        className="w-9 dark:text-gray-300 h-9 rounded-xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-all"
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
                      className="min-w-[340px] max-w-[340px] h-full bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-[30px] flex flex-col shadow-sm overflow-visible"
                    >
                      {/* HEADER */}
                      <div
                        className="relative px-5 pt-5 pb-10 min-h-[160px] rounded-t-[30px] overflow-visible border-b border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkMuted"
                        style={{
                          background: `
      linear-gradient(
        135deg,
        ${stage.color}08 0%,
        transparent 45%
      )
    `,
                        }}
                      >
                        {/* top color line */}
                        {/* <div
                          className="absolute top-0 left-0 right-0 h-[5px] rounded-t-[30px]"
                          style={{
                            background: stage.color,
                          }}
                        /> */}

                        <div className="relative z-10 h-full flex flex-col justify-between">
                          {/* TOP */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                              <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                  background: `${stage.color}18`,
                                  border: `1px solid ${stage.color}35`,
                                }}
                              >
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{
                                    background: stage.color,
                                    boxShadow: `0 0 12px ${stage.color}`,
                                  }}
                                />
                              </div>

                              <div className="min-w-0">
                                <h3 className="font-extrabold text-[16px] text-gray-800 dark:text-white truncate">
                                  {stage.name}
                                </h3>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {stageLeads.length} Leads in this stage
                                </p>
                              </div>
                            </div>

                            <div
                              className="relative"
                              ref={(el) => {
                                stageMenuRefs.current[stage.id] = el;
                              }}
                            >
                              <button
                                onClick={() =>
                                  setOpenStageMenu(
                                    openStageMenu === stage.id ? null : stage.id
                                  )
                                }
                                className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all hover:scale-105 dark:text-white"
                                style={{
                                  background: `${stage.color}15`,
                                  color: stage.color,
                                }}
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              {openStageMenu === stage.id && (
                                <div className="absolute top-11 right-0 z-[99999] w-52 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard shadow-2xl overflow-hidden">
                                  {/* MOVE LEFT */}

                                  <button
                                    onClick={() => {
                                      moveStageLeft(stage);

                                      setOpenStageMenu(null);
                                    }}
                                    className="w-full dark:text-gray-300 h-11 px-4 flex items-center gap-3 hover:bg-surface-soft dark:hover:bg-surface-darkMuted text-sm"
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
                                    className="w-full dark:text-gray-300 h-11 px-4 flex items-center gap-3 hover:bg-surface-soft dark:hover:bg-surface-darkMuted text-sm"
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
                                    className="w-full dark:text-gray-300 h-11 px-4 flex items-center gap-3 hover:bg-yellow-300/15 dark:hover:bg-yellow-300/15 text-sm"
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

                          {/* BOTTOM */}
                          <div className="mt-6 flex items-end justify-between">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                Revenue
                              </p>

                              <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                ₹{total.toLocaleString("en-IN")}
                              </h4>
                            </div>

                            <div
                              className="h-11 px-4 rounded-2xl flex items-center justify-center text-sm font-bold"
                              style={{
                                background: `${stage.color}18`,
                                color: stage.color,
                                border: `1px solid ${stage.color}35`,
                              }}
                            >
                              {stageLeads.length} Cards
                            </div>
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
