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
      setPipelines(res.data || []);
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
      setForm({ name: "", description: "", is_active: true });
      setEditId(null);
      fetchPipelines();
    } catch {
      toast.error("Failed", toastCfg);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    setConfirmDelete({ open: false, id: null });

    try {
      await Token.delete(`/pipelines/${id}`);
      toast.success("Deleted", toastCfg);
      fetchPipelines();
    } catch {
      toast.error("Delete failed", toastCfg);
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

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pipelines</h1>

        <AddButton
          title="Add Pipeline"
          onClick={() => {
            setModalOpen(true);
            setEditId(null);
          }}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : pipelines.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6">
                  No pipelines found
                </td>
              </tr>
            ) : (
              pipelines.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">{p.description}</td>

                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`px-2 py-1 rounded text-sm ${
                        p.is_active
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="p-3 flex gap-2 flex-wrap">
                    <button
                      onClick={() => viewLeads(p.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      View Leads
                    </button>

                    <button
                      onClick={() => duplicatePipeline(p.id)}
                      className="px-2 py-1 bg-purple-500 text-white rounded text-sm"
                    >
                      Duplicate
                    </button>

                    <EditButton onClick={() => openEdit(p)} />

                    <DeleteButton
                      onClick={() =>
                        setConfirmDelete({ open: true, id: p.id })
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        open={modalOpen}
        title={editId ? "Edit Pipeline" : "Create Pipeline"}
        onClose={() => setModalOpen(false)}
        footer={
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-500 text-white rounded"
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
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete Pipeline"
        message="Are you sure?"
        onConfirm={() => handleDelete(confirmDelete.id)}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
}