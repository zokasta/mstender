import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Token from "../../database/Token";

import AddButton from "../../components/tables/AddButton";
import EditButton from "../../components/tables/EditButton";
import DeleteButton from "../../components/tables/DeleteButton";
import ConfirmDialog, { Modal } from "../../components/tables/ConfirmDialog";

export default function PipelineList() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    id: null,
  });

  /* ---------------- FETCH ---------------- */

  const fetchPipelines = async () => {
    setLoading(true);

    try {
      const res = await Token.get("/pipelines");
      setPipelines(res.data.data || []);
    } catch {
      toast.error("Failed to load pipelines", toastCfg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  /* ---------------- CREATE / UPDATE ---------------- */

  const handleSubmit = async () => {
    try {
      if (editId) {
        await Token.put(`/pipelines/${editId}`, form);

        toast.success("Pipeline updated", toastCfg);
      } else {
        await Token.post("/pipelines", form);

        toast.success("Pipeline created", toastCfg);
      }

      setModalOpen(false);

      setForm({
        name: "",
        description: "",
        is_active: true,
      });

      setEditId(null);

      fetchPipelines();
    } catch {
      toast.error("Failed", toastCfg);
    }
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    setConfirmDelete({
      open: false,
      id: null,
    });

    try {
      await Token.delete(`/pipelines/${id}`);

      toast.success("Deleted", toastCfg);

      fetchPipelines();
    } catch {
      toast.error("Delete failed", toastCfg);
    }
  };

  /* ---------------- BULK DELETE ---------------- */

  const bulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error("Select pipelines first", toastCfg);
      return;
    }

    try {
      await Promise.all(
        selectedRows.map((id) => Token.delete(`/pipelines/${id}`))
      );

      toast.success("Selected pipelines deleted", toastCfg);

      setSelectedRows([]);

      fetchPipelines();
    } catch {
      toast.error("Bulk delete failed", toastCfg);
    }
  };

  /* ---------------- BULK STATUS ---------------- */

  const bulkStatusChange = async (status) => {
    if (selectedRows.length === 0) {
      toast.error("Select pipelines first", toastCfg);
      return;
    }

    try {
      await Promise.all(
        selectedRows.map((id) => {
          const pipeline = pipelines.find((p) => p.id === id);

          return Token.put(`/pipelines/${id}`, {
            ...pipeline,
            is_active: status,
          });
        })
      );

      toast.success("Status updated", toastCfg);

      setSelectedRows([]);

      fetchPipelines();
    } catch {
      toast.error("Bulk update failed", toastCfg);
    }
  };

  /* ---------------- TOGGLE ACTIVE ---------------- */

  const toggleActive = async (pipeline) => {
    try {
      await Token.put(`/pipelines/${pipeline.id}`, {
        ...pipeline,
        is_active: !pipeline.is_active,
      });

      fetchPipelines();
    } catch {
      toast.error("Failed", toastCfg);
    }
  };

  /* ---------------- DUPLICATE ---------------- */

  const duplicatePipeline = async (id) => {
    try {
      await Token.post(`/pipelines/${id}/duplicate`);

      toast.success("Duplicated", toastCfg);

      fetchPipelines();
    } catch {
      toast.error("Failed", toastCfg);
    }
  };

  /* ---------------- EDIT ---------------- */

  const openEdit = (pipeline) => {
    setEditId(pipeline.id);

    setForm({
      name: pipeline.name,
      description: pipeline.description || "",
      is_active: pipeline.is_active,
    });

    setModalOpen(true);
  };

  /* ---------------- NAVIGATE ---------------- */

  const viewLeads = (id) => {
    window.location.href = `/leads?pipeline_id=${id}`;
  };

  /* ---------------- CHECKBOX ---------------- */

  const toggleRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedRows((prev) => [...prev, id]);
    }
  };

  const toggleAll = () => {
    if (selectedRows.length === pipelines.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(pipelines.map((p) => p.id));
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6 min-h-screen p-1">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Pipelines
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage sales pipelines and lead workflows
          </p>
        </div>

        <AddButton
          title="Add Pipeline"
          onClick={() => {
            setModalOpen(true);
            setEditId(null);
          }}
        />
      </div>

      {/* BULK ACTIONS */}

      {selectedRows.length > 0 && (
        <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {selectedRows.length} selected
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => bulkStatusChange(true)}
              className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm transition-all duration-200"
            >
              Active
            </button>

            <button
              onClick={() => bulkStatusChange(false)}
              className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-sm transition-all duration-200"
            >
              Inactive
            </button>

            <button
              onClick={bulkDelete}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm transition-all duration-200"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}

      <div className="bg-surface-soft dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-surface-muted dark:bg-surface-darkMuted">
              <tr className="text-left text-slate-600 dark:text-slate-300">
                <th className="p-4 w-[50px]">
                  <input
                    type="checkbox"
                    checked={
                      pipelines.length > 0 &&
                      selectedRows.length === pipelines.length
                    }
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-surface-border"
                  />
                </th>

                <th className="p-4 font-semibold">Name</th>

                <th className="p-4 font-semibold">Description</th>

                <th className="p-4 font-semibold">Status</th>

                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-slate-500 dark:text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : pipelines.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-slate-500 dark:text-slate-400"
                  >
                    No pipelines found
                  </td>
                </tr>
              ) : (
                pipelines.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-surface-border dark:border-surface-darkBorder hover:bg-surface-muted dark:hover:bg-surface-darkMuted transition-all duration-200"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(p.id)}
                        onChange={() => toggleRow(p.id)}
                        className="w-4 h-4 rounded border-surface-border"
                      />
                    </td>

                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                      {p.name}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {p.description || "-"}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                          p.is_active
                            ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                            : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => viewLeads(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs transition-all duration-200"
                        >
                          View Leads
                        </button>

                        <button
                          onClick={() => duplicatePipeline(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-xs transition-all duration-200"
                        >
                          Duplicate
                        </button>

                        <EditButton onClick={() => openEdit(p)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}

      <Modal
        open={modalOpen}
        title={editId ? "Edit Pipeline" : "Create Pipeline"}
        onClose={() => setModalOpen(false)}
        footer={
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all duration-200"
          >
            {editId ? "Update" : "Create"}
          </button>
        }
      >
        <div className="space-y-4">
          <input
            placeholder="Pipeline Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full h-11 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkSoft px-4 text-slate-700 dark:text-slate-200 outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full h-32 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-soft dark:bg-surface-darkSoft px-4 py-3 text-slate-700 dark:text-slate-200 outline-none resize-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10"
          />
        </div>
      </Modal>

      {/* DELETE CONFIRM */}

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Pipeline"
        message="Are you sure?"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() =>
          setConfirmDelete({
            open: false,
            id: null,
          })
        }
      />
    </div>
  );
}
