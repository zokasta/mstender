import { useState } from "react";
import { createPortal } from "react-dom";
import { FaPlus } from "react-icons/fa";
import Token from "../../database/Token";
import Input from "../../components/elements/Input";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";

export default function AddNewStageButton({
  activePipelineId,
  activePipeline,
  setPipelines = () => {},
}) {
  const [showPopup, setShowPopup] = useState(false);

  const [loading, setLoading] = useState(false);

  const [editingStage, setEditingStage] = useState(null);

  const [newStageData, setNewStageData] = useState({
    name: "",
    color: "#3b82f6",
    is_default: false,
  });

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const resetModal = () => {
    setShowPopup(false);

    setEditingStage(null);

    setLoading(false);

    setNewStageData({
      name: "",
      color: "#3b82f6",
      is_default: false,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE STAGE
  |--------------------------------------------------------------------------
  */

  const saveStage = async () => {
    try {
      if (!newStageData.name) {
        alert("Stage name is required");
        return;
      }

      if (!activePipelineId) {
        alert("Please select Lead Set");
        return;
      }

      setLoading(true);

      /*
      |--------------------------------------------------------------------------
      | UPDATE
      |--------------------------------------------------------------------------
      */

      if (editingStage) {
        const res = await Token.put(`/pipeline-stages/${editingStage.id}`, {
          name: newStageData.name,
          color: newStageData.color,
          is_default: newStageData.is_default,
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
        | CREATE
        |--------------------------------------------------------------------------
        */

        const res = await Token.post("/pipeline-stages", {
          pipeline_id: activePipelineId,

          name: newStageData.name,

          color: newStageData.color,

          is_default: newStageData.is_default,

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

      resetModal();
    } catch (err) {
      console.log(err);

      alert(err?.response?.data?.message || "Failed to save stage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer {...toastCfg} />
      {/* =====================================================
          BUTTON
      ===================================================== */}

      <button
        onClick={() => {
          if (!activePipelineId) {
            toast.warn("Please Select Lead Set", toastCfg);
            return;
          }
          setShowPopup(true);
        }}
        className="h-12 px-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-primary-50 dark:hover:bg-surface-darkMuted text-gray-700 dark:text-gray-300 font-medium transition-all flex items-center gap-3"
      >
        <div className="w-7 h-7 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
          <FaPlus size={11} />
        </div>

        <span className="text-sm">Stages</span>
      </button>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showPopup &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center p-5">
              <div className="w-full max-w-xl rounded-[32px] overflow-hidden bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder shadow-2xl">
                {/* HEADER */}

                <div className="px-7 py-6 border-b border-surface-border dark:border-surface-darkBorder flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-800 dark:text-white">
                      {editingStage ? "Update Stage" : "Create Stage"}
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Configure pipeline stages
                    </p>
                  </div>

                  <button
                    onClick={resetModal}
                    className="w-11 h-11 dark:text-gray-300 rounded-2xl bg-surface-soft dark:bg-surface-darkMuted hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center"
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
                        New leads will automatically move here
                      </p>
                    </div>
                  </label>

                  {/* FOOTER */}
                  <div className="shrink-0 px-8 py-5 border-t border-surface-border dark:border-surface-darkBorder flex items-center justify-end gap-4">
                    <button
                      onClick={resetModal}
                      disabled={loading}
                      className="h-14 px-8 rounded-2xl border dark:text-gray-300 border-surface-border dark:border-surface-darkBorder hover:bg-surface-soft dark:hover:bg-surface-darkMuted font-semibold"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={saveStage}
                      disabled={loading}
                      className="h-14 min-w-[180px] px-8 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50"
                    >
                      {loading
                        ? "Saving..."
                        : editingStage
                        ? "Update Stage"
                        : "Create Stage"}
                    </button>
                  </div>

                  {/* <div className="flex items-center justify-end gap-4 pt-5 border-t border-surface-border dark:border-surface-darkBorder">
                    <button
                      onClick={resetModal}
                      disabled={loading}
                      className="h-13 px-7 rounded-2xl border border-surface-border dark:border-surface-darkBorder font-semibold"
                    >
                      Cancel
                    </button>

                    <button
                      disabled={loading}
                      onClick={saveStage}
                      className="h-13 px-7 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20"
                    >
                      {loading
                        ? "Saving..."
                        : editingStage
                        ? "Update Stage"
                        : "Create Stage"}
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
