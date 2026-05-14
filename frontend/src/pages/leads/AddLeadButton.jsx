import { useState } from "react";
import { createPortal } from "react-dom";

import AddButton from "../../components/tables/AddButton";
import Token from "../../database/Token";

import Select from "../../components/elements/Select";
import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";

export default function AddLeadButton({
  setLeads = () => {},
  pipelines = [],
  onSuccess = () => {},
  pipeline_id,
}) {
  const [showAddLead, setShowAddLead] = useState(false);

  const [activePipelineId, setActivePipelineId] = useState("");

  const [editingLead, setEditingLead] = useState(null);

  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | ACTIVE PIPELINE
  |--------------------------------------------------------------------------
  */

  const activePipeline =
    pipelines.find(
      (item) => item.id.toString() === activePipelineId.toString()
    ) || null;

  /*
  |--------------------------------------------------------------------------
  | FORM DATA
  |--------------------------------------------------------------------------
  */

  const [newLeadData, setNewLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    gstin: "",
    website: "",
    source: "",
    address: "",
    description: "",
    value: "",
    priority: "cold",
  });

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const resetLeadModal = () => {
    setEditingLead(null);

    setShowAddLead(false);

    setActivePipelineId("");

    setLoading(false);

    setNewLeadData({
      name: "",
      email: "",
      phone: "",
      company: "",
      gstin: "",
      website: "",
      source: "",
      address: "",
      description: "",
      value: "",
      priority: "cold",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE LEAD
  |--------------------------------------------------------------------------
  */

  const addNewLead = async () => {
    try {
      if (!activePipelineId) {
        alert("Please select pipeline");
        return;
      }

      if (!newLeadData.name) {
        alert("Lead name is required");
        return;
      }

      setLoading(true);

      const res = await Token.post("/leads", {
        ...newLeadData,

        pipeline_id: activePipelineId,

        stage_id: activePipeline?.stages?.[0]?.id,
      });

      setLeads((prev) => [...prev, res.data.data]);

      onSuccess(res.data.data);

      resetLeadModal();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message || "Failed to create lead"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE LEAD
  |--------------------------------------------------------------------------
  */

  const updateLead = async () => {
    try {
      setLoading(true);

      const res = await Token.put(`/leads/${editingLead.id}`, {
        ...newLeadData,
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === editingLead.id
            ? res.data.data
            : lead
        )
      );

      onSuccess(res.data.data);

      resetLeadModal();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message || "Failed to update lead"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =====================================================
          FULLSCREEN MODAL USING PORTAL
      ===================================================== */}

      {showAddLead &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-md">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-[98vw] h-[96vh] rounded-[32px] overflow-hidden border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard shadow-2xl flex flex-col">
                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="shrink-0 px-8 py-6 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white">
                      {editingLead
                        ? "Update Lead"
                        : "Create New Lead"}
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Manage customer lead information and sales pipeline data
                    </p>
                  </div>

                  <button
                    onClick={resetLeadModal}
                    className="w-12 h-12 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-all text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* =====================================================
                    BODY
                ===================================================== */}

                <div className="flex-1 overflow-y-auto scroll-bar p-8">
                  {/* PIPELINE */}

                  <div className="mb-8">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                      Pipeline
                    </label>

                    <Select
                      value={activePipelineId}
                      onChange={(e) =>
                        setActivePipelineId(e)
                      }
                    >
                      <option value="">
                        Select Pipeline
                      </option>

                      {pipelines.map((pipeline) => (
                        <option
                          key={pipeline.id}
                          value={pipeline.id}
                        >
                          {pipeline.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* BASIC INFO */}

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="Lead Name"
                        value={newLeadData.name}
                        onChange={(e) =>
                          setNewLeadData((prev) => ({
                            ...prev,
                            name: e,
                          }))
                        }
                        placeholder="Enter lead name"
                      />

                      <Input
                        label="Company"
                        value={newLeadData.company}
                        onChange={(e) =>
                          setNewLeadData((prev) => ({
                            ...prev,
                            company: e,
                          }))
                        }
                        placeholder="Enter company"
                      />

                      <Input
                        label="Email"
                        value={newLeadData.email}
                        onChange={(e) =>
                          setNewLeadData((prev) => ({
                            ...prev,
                            email: e,
                          }))
                        }
                        placeholder="Enter email"
                      />

                      <Input
                        label="Phone"
                        value={newLeadData.phone}
                        onChange={(e) =>
                          setNewLeadData((prev) => ({
                            ...prev,
                            phone: e,
                          }))
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* BUSINESS */}

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
                      Business Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input
                        label="GST Number"
                        value={newLeadData.gstin}
                        onChange={(e) =>
                          setNewLeadData((prev) => ({
                            ...prev,
                            gstin: e,
                          }))
                        }
                        placeholder="Enter GST number"
                      />

                      <Input
                        label="Website"
                        value={newLeadData.website}
                        onChange={(e) =>
                          setNewLeadData((prev) => ({
                            ...prev,
                            website: e,
                          }))
                        }
                        placeholder="Enter website"
                      />

                      <Input
                        type="number"
                        label="Deal Value"
                        value={newLeadData.value}
                        onChange={(e) =>
                          setNewLeadData((prev) => ({
                            ...prev,
                            value: e,
                          }))
                        }
                        placeholder="Enter deal value"
                      />

                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Lead Priority
                        </label>

                        <Select
                          value={newLeadData.priority}
                          onChange={(e) =>
                            setNewLeadData((prev) => ({
                              ...prev,
                              priority: e.target.value,
                            }))
                          }
                        >
                          <option value="hot">Hot</option>

                          <option value="warm">Warm</option>

                          <option value="cold">Cold</option>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Lead Source
                        </label>

                        <Select
                          value={newLeadData.source}
                          onChange={(e) =>
                            setNewLeadData((prev) => ({
                              ...prev,
                              source: e.target.value,
                            }))
                          }
                        >
                          <option value="">
                            Select Source
                          </option>

                          <option value="Website">
                            Website
                          </option>

                          <option value="Facebook">
                            Facebook
                          </option>

                          <option value="Instagram">
                            Instagram
                          </option>

                          <option value="LinkedIn">
                            LinkedIn
                          </option>

                          <option value="Referral">
                            Referral
                          </option>

                          <option value="WhatsApp">
                            WhatsApp
                          </option>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* ADDITIONAL */}

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-5">
                      Additional Information
                    </h3>

                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Address
                        </label>

                        <textarea
                          value={newLeadData.address}
                          onChange={(e) =>
                            setNewLeadData((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="Enter address"
                          className="w-full rounded-3xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkMuted px-5 py-4 outline-none resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Description
                        </label>

                        <Textarea
                          value={newLeadData.description}
                          onChange={(e) =>
                            setNewLeadData((prev) => ({
                              ...prev,
                              description: e,
                            }))
                          }
                          rows={6}
                          placeholder="Write lead description..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* =====================================================
                    FOOTER
                ===================================================== */}

                <div className="shrink-0 px-8 py-5 border-t border-surface-border dark:border-surface-darkBorder flex items-center justify-end gap-4">
                  <button
                    onClick={resetLeadModal}
                    disabled={loading}
                    className="h-14 px-8 rounded-2xl border border-surface-border dark:border-surface-darkBorder hover:bg-surface-soft dark:hover:bg-surface-darkMuted font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => {
                      if (editingLead) {
                        updateLead();
                      } else {
                        addNewLead();
                      }
                    }}
                    className="h-14 min-w-[180px] px-8 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingLead
                      ? "Update Lead"
                      : "Create Lead"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* =====================================================
          OPEN BUTTON
      ===================================================== */}

      <AddButton
        onClick={() => setShowAddLead(true)}
        title="New Lead"
      />
    </>
  );
}