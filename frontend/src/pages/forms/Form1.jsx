import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../../components/elements/Input";
import Textarea from "../../components/elements/Textarea";
import Button from "../../components/elements/Button";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Loading from "../../assets/SVG/Loading";
import ReactMoment from "react-moment";
import Axios from "../../database/Axios";

export default function CreateCustomer() {
  const { groupId: paramGroupId, groupToken: paramGroupToken } = useParams();
  const navigate = useNavigate();

  const [loadingMain, setLoadingMain] = useState("loading"); // page load state
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [group, setGroup] = useState(null); // group/trip info from server
  const [pickups, setPickups] = useState([]);
  const [submittedResponse, setSubmittedResponse] = useState(null);

  // form state (controlled)
  const [form, setForm] = useState({
    name: "",
    email: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
    hometown: "",
    pickup_id: "",
  });

  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  // file handled separately and added to FormData
  const [identityPreview, setIdentityPreview] = useState(null);
  const fileRef = useRef(null);
  const formDataRef = useRef(new FormData());

  // initialize with params
  const groupId = paramGroupId ?? "";
  const groupToken = paramGroupToken ?? "";

  // fetch group/trip check endpoint (uses your /group/check?token=...&trip=... pattern)
  useEffect(() => {
    async function fetchGroupCheck() {
      try {
        setLoadingMain(true);
        const res = await Axios.post("/groups/check", { token: groupToken, group: groupId });
        if (res.data && res.data.status) {
          setGroup(res.data.trip || null);
          setPickups(
            (res.data.trip?.pickups || []).map((p) => ({
              id: p.id,
              title: p.location,
            }))
          );
        } else {
          setGroup(res.data); // store error message also
          setLoadingMain("error");
        }

        // Expecting { status: true/false, trip: {...}, group_id }
        // if (res.data && res.data.status) {
        //   setGroup(res.data.trip || null);
        //   setPickups(
        //     (res.data.trip?.pickups || []).map((p) => ({
        //       id: p.id,
        //       title: p.location,
        //     }))
        //   );
        // } else {
        //   // permission / token invalid or broken
        //   setLoadingMain("error");
        //   setGroup(null);
        // }
      } catch (err) {
        setLoadingMain("error");

        console.error("Group check failed", err);
      } finally {
        // setLoadingMain(false);
      }
    }

    fetchGroupCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, groupToken]);

  useEffect(() => {
    setSubmittedResponse(localStorage.getItem("group_token"));
  }, []);
  // helper to update controlled fields and formData
  const handleFieldChange = (field, value) => {
    setForm((s) => ({ ...s, [field]: value }));
    // keep FormData in sync (useful if user didn't touch file)
    formDataRef.current.set(field, value);
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      fileRef.current = null;
      formDataRef.current.delete("identity_image");
      setIdentityPreview(null);
      return;
    }

    // preview if image
    if (f.type.startsWith("image/")) {
      const r = new FileReader();
      r.onloadend = () => setIdentityPreview(r.result);
      r.readAsDataURL(f);
    } else {
      setIdentityPreview(null);
    }

    fileRef.current = f;
    formDataRef.current.set("identity_image", f);
    setErrors((e) => ({ ...e, identity_image: "" }));
  };

  // client-side validation
  const validate = () => {
    const err = {};
    if (!form.name || !form.name.trim()) err.name = "Name is required.";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      err.email = "Valid email is required.";
    if (!form.dob) err.dob = "Date of birth is required.";
    if (!form.gender || !["male", "female"].includes(form.gender))
      err.gender = "Gender is required.";
    if (!form.phone || form.phone.trim().length < 6)
      err.phone = "Phone is required.";
    if (!form.address || !form.address.trim())
      err.address = "Address is required.";
    if (!form.hometown || !form.hometown.trim())
      err.hometown = "Hometown is required.";
    if (!form.pickup_id) err.pickup_id = "Please select a pickup location.";
    // if (!form.identity_image) err.identity_image = "Please Upload your identity image.";

    // file size/type check (optional)
    const file = formDataRef.current.get("identity_image");
    if (file) {
      const allowed = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowed.includes(file.type))
        err.identity_image = "Only JPG/PNG/PDF allowed.";
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) err.identity_image = "File must be <= 10MB.";
    }

    if (!agreeTerms) err.terms = "You must agree to terms and conditions.";

    setErrors(err);
    // toast first error(s)
    Object.values(err).forEach((m) => m && toast.error(m, toastCfg));
    return Object.keys(err).length === 0;
  };

  // submit handler
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    // prepare hidden fields
    formDataRef.current.set("group_id", groupId);
    formDataRef.current.set("group_token", groupToken);

    // ensure fields exist on FormData
    Object.entries(form).forEach(([k, v]) => {
      if (!formDataRef.current.has(k) && v !== undefined && v !== null) {
        formDataRef.current.set(k, v);
      }
    });

    if (!validate()) return;

    setLoadingSubmit(true);
    try {
      // Use Token wrapper (it should set baseURL and headers)
      const res = await Axios.post("/customers", formDataRef.current, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // expected to return created customer or message
      const data = res.data || {};
      localStorage.setItem("customer_form_response", JSON.stringify(data));
      localStorage.setItem("group_token", groupToken);
      setSubmittedResponse(groupToken);

      toast.success(data.message || "Submitted", toastCfg);
    } catch (err) {
      console.error("Submit failed", err);
      // handle Laravel validation
      if (err.response?.status === 422 && err.response.data?.errors) {
        const serverErrs = err.response.data.errors;
        const normalized = {};
        Object.keys(serverErrs).forEach(
          (k) =>
            (normalized[k] = Array.isArray(serverErrs[k])
              ? serverErrs[k][0]
              : serverErrs[k])
        );
        setErrors(normalized);
        Object.values(normalized).forEach((m) => toast.error(m, toastCfg));
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message, toastCfg);
      } else {
        toast.error("Failed to submit", toastCfg);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  // loading state or invalid link
  if (loadingMain === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="scale-[300%]">
          <Loading />
        </div>
      </div>
    );
  }

  if (loadingMain === "loading")
    if (!group) {
      // If server returned that token invalid / group not accessible
      return (
        <div className="flex items-center justify-center h-screen p-4 bg-surface-muted dark:bg-surface-darkMuted">
          <div className="bg-white dark:bg-surface-darkCard p-8 rounded shadow-md max-w-xl text-center">
            <h2 className="text-2xl font-bold text-primary-500">
              Invalid or expired link
            </h2>
            <p className="mt-3 text-gray-700">
              The group link is invalid, expired, or you don&apos;t have
              permission to access it.
            </p>
            <div className="mt-6">
              <Button
                title="Go back"
                theme="primary"
                onClick={() => navigate("/")}
              />
            </div>
          </div>
        </div>
      );
    }

  if (loadingMain === "error") {
    return (
      <div className="flex items-center justify-center h-screen p-4 bg-surface-muted dark:bg-surface-darkMuted">
        <div className="bg-white dark:bg-surface-darkCard p-8 rounded shadow-md max-w-xl text-center">
          <h2 className="text-2xl font-bold text-primary-500">
            Registration Not Available
          </h2>

          <p className="mt-3 text-gray-700">
            {group?.message ??
              "This group is currently not accepting registrations."}
          </p>

          <div className="mt-6">
            <Button
              title="Go back"
              theme="primary"
              onClick={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    );
  }

  // if already submitted and response stored
  if (submittedResponse && submittedResponse === groupToken) {
    const out = submittedResponse;
    return (
      <div className="flex items-center justify-center bg-[#e4e3e3] h-screen">
        <div className="bg-white dark:bg-surface-darkCard p-6 rounded-md shadow-md max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold">
            Thank you{" "}
            <span className="text-primary-500">{out.data?.name ?? ""}</span>
          </h1>
          <p className="mt-3">
            Your application has been received. We will contact you with
            details.
          </p>

          <div className="mt-4">
            <p>
              <strong>Customer ID:</strong>{" "}
              <span className="text-primary-500">{out.data?.id ?? "—"}</span>
            </p>
            <p>
              <strong>Contact:</strong>{" "}
              <span className="text-primary-500">{out.data?.phone ?? "—"}</span>
            </p>
          </div>

          <div className="mt-6">
            <Button
              title="Add more person details"
              theme="primary"
              onClick={() => {
                localStorage.removeItem("group_token");
                setSubmittedResponse(true);
                setForm({
                  name: "",
                  email: "",
                  dob: "",
                  gender: "",
                  phone: "",
                  address: "",
                  hometown: "",
                  pickup_id: "",
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default: render the form
  return (
    <div className="bg-[#e4e3e3] min-h-screen flex justify-center px-4 py-10">
      <ToastContainer {...toastCfg} />
      <div className="max-w-3xl w-full">
        <div className="bg-primary-500 text-white rounded-t-lg px-6 py-4 shadow">
          <h1 className="text-2xl font-bold">
            {group?.trip_name ?? "Join Group"}
          </h1>
          <p className="text-sm opacity-90 mt-1">
            {group ? (
              <>
                <ReactMoment format="DD MMM YYYY">
                  {group.departure_date ?? group.start_date}
                </ReactMoment>
                {" — "}
                {group.title ?? group.trip_name}
              </>
            ) : (
              "Fill the form to join the group"
            )}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-surface-darkCard rounded-b-lg shadow p-6 border border-t-0 space-y-6"
          encType="multipart/form-data"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full name"
              value={form.name}
              onChange={(v) => handleFieldChange("name", v)}
              error={errors.name}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => handleFieldChange("email", v)}
              error={errors.email}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="DOB"
              type="date"
              value={form.dob}
              onChange={(v) => handleFieldChange("dob", v)}
              error={errors.dob}
              required
            />
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Gender<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={form.gender}
                onChange={(e) => handleFieldChange("gender", e.target.value)}
                className={`w-full h-10 bg-surface-light dark:bg-surface-dark border rounded-sm outline-none px-3 ${
                  errors.gender
                    ? "border-red-500"
                    : "border-gray-300 focus:border-primary-500"
                }`}
              >
                <option value="none">---- Select Gender ----</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-500 mt-1">{errors.gender}</p>
              )}
            </div>
            <Input
              label="Phone"
              type="phone"
              country="in"
              value={form.phone}
              onChange={(v) => handleFieldChange("phone", v)}
              error={errors.phone}
              required
            />
          </div>

          <div>
            <Textarea
              label="Address"
              value={form.address}
              onChange={(v) => handleFieldChange("address", v)}
              error={errors.address}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Hometown"
              value={form.hometown}
              onChange={(v) => handleFieldChange("hometown", v)}
              error={errors.hometown}
              required
            />
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Pickup Location<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={form.pickup_id}
                onChange={(e) => handleFieldChange("pickup_id", e.target.value)}
                className={`w-full h-10 f4f6f8] border rounded-sm outline-none px-3 ${
                  errors.pickup_id
                    ? "border-red-500"
                    : "border-gray-300 focus:border-primary-500"
                }`}
              >
                <option value="">-- Select Pickup --</option>
                {pickups.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              {errors.pickup_id && (
                <p className="text-xs text-red-500 mt-1">{errors.pickup_id}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Identity (Aadhar/ID)
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFile}
              className="block w-full text-sm text-gray-700 bg-surface-light dark:bg-surface-dark border rounded-sm px-3 py-2"
            />
            {errors.identity_image && (
              <p className="text-xs text-red-500 mt-1">
                {errors.identity_image}
              </p>
            )}
            {identityPreview && (
              <div className="mt-2">
                <p className="font-bold">Preview:</p>
                <img
                  src={identityPreview}
                  alt="preview"
                  className="max-w-xs max-h-48 rounded-md shadow-md"
                />
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={() => setAgreeTerms((v) => !v)}
              className="w-4 h-4 border-gray-300"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree & have read the{" "}
              <a
                className="text-blue-800 hover:text-blue-900"
                target="_blank"
                rel="noreferrer"
                href="https://junoontrekking.in/terms-and-conditions/"
              >
                Terms & Conditions
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-500 mt-1">{errors.terms}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button title="Cancel" theme="gray" onClick={() => navigate(-1)} />
            <Button
              title={loadingSubmit ? "Submitting..." : "Submit"}
              isLoading={loadingSubmit}
              theme="primary"
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
