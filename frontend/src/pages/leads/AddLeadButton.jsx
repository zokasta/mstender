import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Token from "../../database/Token";

import Select from "../../components/elements/Select";
import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import { Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

export default function AddLeadButton({
  setLeads = () => {},
  pipelines = [],
  onSuccess = () => {},
  pipeline_id,

  showAddLead,
  setShowAddLead,

  editingLead,
  setEditingLead,
}) {
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | ACTIVE PIPELINE
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (editingLead) {
      setNewLeadData({
        name: editingLead.name || "",
        email: editingLead.email || "",
        phone: editingLead.phone || "",
        company: editingLead.company || "",
        gstin: editingLead.gstin || "",
        website: editingLead.website || "",
        source: editingLead.source || "",
        address: editingLead.address || "",
        description: editingLead.description || "",
        value: editingLead.value || "",
        status: editingLead.status || "cold",
      });
  
      setShowAddLead(true);
    }
  }, [editingLead]);

  const activePipeline =
    pipelines.find((item) => String(item.id) === String(pipeline_id || "")) ||
    null;

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
    status: "cold",
  });

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const resetLeadModal = () => {
    setEditingLead(null);
    setShowAddLead(false);
  
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
      status: "warm",
    });
    setLoading(false)
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE LEAD
  |--------------------------------------------------------------------------
  */

  const addNewLead = async () => {
    try {
      if (!pipeline_id) {
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
        pipeline_id: pipeline_id,
        stage_id: activePipeline?.stages?.[0]?.id,
      });

      setLeads((prev) => [...prev, res.data.data]);

      onSuccess(res.data.data);

      resetLeadModal();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to create lead");
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
        pipeline_id:pipeline_id,
        ...newLeadData,
      });

      setLeads((prev) =>
        prev.map((lead) => (lead.id === editingLead.id ? res.data.data : lead))
      );

      onSuccess(res.data.data);

      resetLeadModal();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer {...toastCfg} />
      {/* =====================================================
          FULLSCREEN MODAL USING PORTAL
      ===================================================== */}

      {showAddLead &&
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
                      {editingLead ? "Update Lead" : "Create New Lead"}
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Manage customer lead information and sales pipeline data
                    </p>
                  </div>

                  <button
                    onClick={resetLeadModal}
                    className="w-12 h-12 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-all text-xl dark:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                {/* =====================================================
                    BODY
                ===================================================== */}

                <div className="flex-1 overflow-y-auto scroll-bar p-8">
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
                        placeholder="Enter Name"
                        required
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
                        required
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
                        required
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
                          Lead Status
                        </label>

                        <Select
                          value={newLeadData.status}
                          onChange={(e) =>
                            setNewLeadData((prev) => ({
                              ...prev,
                              status: e,
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
                              source: e,
                            }))
                          }
                        >
                          <option value="unknown"> Select Source</option>
                          <option value="Website">Website</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Referral">Referral</option>
                          <option value="WhatsApp">WhatsApp</option>
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

                        <Textarea
                          value={newLeadData.address}
                          onChange={(e) =>
                            setNewLeadData((prev) => ({
                              ...prev,
                              address: e,
                            }))
                          }
                          rows={3}
                          placeholder="Enter address"
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
                    className="h-14 px-8 rounded-2xl border dark:text-gray-300 border-surface-border dark:border-surface-darkBorder hover:bg-surface-soft dark:hover:bg-surface-darkMuted font-semibold"
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

      <button
        onClick={() => {
          if (!pipeline_id) {
            toast.warn("Please Select Lead Set first", toastCfg);
            return;
          }
          setShowAddLead(true);
        }}
        className="h-12 px-5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all flex items-center gap-3 font-semibold"
      >
        <Plus size={17} />

        <span className="text-sm">Add New Lead</span>
      </button>
    </>
  );
}
