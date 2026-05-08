// src/Pages/Employees/CreateEmployee.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/elements/Input";
import Select from "../../components/elements/Select";
import Token from "../../database/Token";
import { toast, ToastContainer } from "react-toastify";
import { toastCfg } from "../../data/toastCfg";
import Button from "../../components/elements/Button";
import env from "../../data/env";
import CardUI from "../../common/UI/CardUI";
import CopyLinkButton from "../../components/tables/CopyLinkButton";
import CloseButton from "../../components/tables/CloseButton";
import SelectSearch from "../../components/elements/SelectSearch";
const mapStatusToDb = (status) => {
  switch (status) {
    case "Active":
      return "active";
    case "Inactive":
      return "inactive";
    case "On Leave":
      return "pending";
    case "Terminated":
      return "suspended";
    default:
      return "active";
  }
};

export default function CreateEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    type: "employee",
    status: "Active",
    password: "",
  });

  const [form2, setForm2] = useState({
    email: "",
    username: "",
    type_id: "",
  });
  const [loading, setLoading] = useState({ employee: false, quick: false });
  const [errors, setErrors] = useState({});

  // const [inviteLink, setInviteLink] = useState(
  //   "http://localhost:3000/invite?username=don't know&email=donknw@gmai.c&token=oeYIJmpJzJXP9XTVd9xXFfiyIcoyux9kvm95lhMPt4cEJybwQOtqapHRzpAL"
  // );
  const [inviteLink, setInviteLink] = useState("");
  const [types, setTypes] = useState([]);

  const handleChange = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange2 = (field, value) => {
    setForm2((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const handleTypeFetch = async () => {
      try {
        const response = await Token.get("/types");
        // toast.success("Employee created successfully", toastCfg);
        // navigate("/employees");
        setTypes(response.data.data);
      } catch (error) {
        console.error("Failed to create employee:", error);

        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const firstKey = Object.keys(errors)[0];
          const firstMsg = errors[firstKey]?.[0];
          toast.error(firstMsg || "Validation error", toastCfg);
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message, toastCfg);
        } else {
          toast.error("Failed to create employee", toastCfg);
        }
      }
    };
    handleTypeFetch();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Employee name is required.";
    if (!form.username.trim())
      newErrors.username = "Employee username is required.";
    if (!form.email.trim()) newErrors.email = "Employee email is required.";
    if (!form.password.trim())
      newErrors.password = "Employee Password is required.";
    if (!form.phone.trim())
      newErrors.phone = "Employee phone number is required.";
    if (!form.type_id.trim()) newErrors.type = "Employee type is required.";
    // if (!form.account_type.trim() || form.account_type === "-- Select Status --")
    //   newErrors.account_type = "Account type is required.";

    setErrors(newErrors);

    // show toast notifications
    Object.values(newErrors).forEach((msg) => toast.error(msg, toastCfg));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // stop if invalid
    if (loading.employee) return;

    // basic front-end checks
    if (!form.name || !form.username || !form.email || !form.password) {
      toast.error("Name, username, email and password are required", toastCfg);
      return;
    }

    const payload = {
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone || null,
      dob: form.dob || null,
      gender: form.gender || null,
      status: mapStatusToDb(form.status),
      password: form.password,
    };

    try {
      setLoading({ ...loading, employee: true });
      await Token.post("/employees", payload);
      toast.success("Employee created successfully", toastCfg);
      navigate("/employees");
    } catch (error) {
      console.error("Failed to create employee:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors[firstKey]?.[0];
        toast.error(firstMsg || "Validation error", toastCfg);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, toastCfg);
      } else {
        toast.error("Failed to create employee", toastCfg);
      }
    } finally {
      setLoading({ ...loading, employee: false });
    }
  };

  const handleGenerateInvite = async () => {
    console.log(form2);
    try {
      setLoading({ ...loading, quick: true });

      const response = await Token.post("/employees/quick-assign", form2);
      console.log(response.data.user);
      // alert('this is popup')
      const dummyLink = `${env.BASE_URL}/invite?username=${form2.username}&email=${form2.email}&token=${response.data.remember_token}`;
      setInviteLink(dummyLink);
    } catch (error) {
      console.error("Failed to create employee:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors[firstKey]?.[0];
        toast.error(firstMsg || "Validation error", toastCfg);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, toastCfg);
      } else {
        toast.error("Failed to create employee", toastCfg);
      }
    }

    setLoading({ ...loading, quick: false });

    toast.success("Invite link generated", toastCfg);
  };

  return (
    <div className="space-y-6">
      <ToastContainer {...toastCfg} />

      <h1 className="text-2xl font-bold text-gray-800">Create Employee</h1>

      {/* Normal Employee Creation Card */}
      <div className="bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Employee Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              placeholder="Full Name"
              label="Name"
              value={form.name}
              onChange={(val) => handleChange("name", val)}
              required
              error={errors.name}
            />
            <Input
              placeholder="Username"
              label="Username"
              value={form.username}
              onChange={(val) => handleChange("username", val)}
              required
              error={errors.username}
            />
            <Input
              placeholder="Email Address"
              label="Email"
              type="email"
              value={form.email}
              onChange={(val) => handleChange("email", val)}
              required
              error={errors.email}
            />
            <Input
              placeholder="Phone Number"
              label="Phone"
              type="tel"
              value={form.phone}
              onChange={(val) => handleChange("phone", val)}
              required
              error={errors.phone}
            />
            <Input
              placeholder="Date of Birth"
              label="DOB"
              type="date"
              value={form.dob}
              onChange={(val) => handleChange("dob", val)}
            />
            <Select
              label="Gender"
              value={form.gender}
              onChange={(val) => handleChange("gender", val)}
            >
              <option value="">-- Select Gender --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>

            <SelectSearch
              api="/types"
              method="get"
              onChange={(v) => handleChange('type_id',v)}
              value={form.type_id || ""}
              label="Select Type"
              placeholder="---- Select Type ----"
              labelKey="name"
              isDefault={false}
            />
            <Select
              label="Type"
              value={form.type_id}
              onChange={(val) => handleChange("type_id", val)}
            >
              <option value="none">Select Type</option>
              {types.map((list, index) => (
                <option key={index} value={list.name}>
                  {list.name}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(val) => handleChange("status", val)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </Select>
            <Input
              placeholder="Initial Password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(val) => handleChange("password", val)}
              required
              error={errors.password}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.employee}
              className={`px-4 py-2 rounded-md text-white ${
                !loading
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading.employee ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>

      {inviteLink && (
        <CardUI>
          <div className="p-3 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-800 font-medium">
              Invite Link Generated:
            </p>
            <a
              href={inviteLink}
              target="_blank"
              rel="noreferrer"
              className="text-orange-600 underline text-sm break-all"
            >
              {inviteLink}
            </a>
            <p className="text-xs text-gray-500 mt-2">
              (This link will also be sent to the employee&apos;s email)
            </p>
          </div>
          <div className="grid grid-cols-2 w-fit gap-2 mt-4">
            <CopyLinkButton url={inviteLink} color="bg-orange-500" />
            <CloseButton
              onClick={() => {
                setForm2({ email: "", username: "", type_id: "" });
                setInviteLink("");
              }}
            />
          </div>{" "}
        </CardUI>
      )}
      {/* Quick Create (Invite Link) Card */}
      <div className="bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Quick Create Employee</h2>
        <p className="text-sm text-gray-600 mb-4">
          Generate an invite link for an employee to fill their own details.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <Select
            value={form2.type}
            onChange={(val) => handleChange2("type_id", val)}
          >
            <option value="">---- Select Type -----</option>
            {types.map((list, index) => (
              <option key={index} value={list.id}>
                {list.name}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Employee username"
            type="text"
            value={form2.username}
            onChange={(val) => handleChange2("username", val)}
          />
          <Input
            placeholder="Employee Email"
            type="email"
            value={form2.email}
            onChange={(val) => handleChange2("email", val)}
          />
        </div>
        <div>
          <Button
            theme="orange"
            onClick={handleGenerateInvite}
            title={loading.quick ? "Loading..." : "Generate Invite Link"}
            className="mt-4 py-1"
            disabled={loading.quick}
          />
        </div>

        {/* {inviteLink && (
          <div className="mt-4 p-3 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-800 font-medium">
              Invite Link Generated:
            </p>
            <a
              href={inviteLink}
              target="_blank"
              rel="noreferrer"
              className="text-orange-600 underline text-sm break-all"
            >
              {inviteLink}
            </a>
            <p className="text-xs text-gray-500 mt-2">
              (This link will also be sent to the employee&apos;s email)
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
}
