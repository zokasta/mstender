// src/App.jsx
import { Routes, Route } from "react-router-dom";

// Layout
import AdminLayout from "./components/layout/AdminLayout";

// Middleware
import ProtectedRoute from "./middleware/ProtectedRoute";

// pages
import Dashboard from "./pages/dashboard/Dashboard";

// leads
import LeadList from "./pages/leads/LeadList";
import CreateLead from "./pages/leads/CreateLead";
import UpdateLead from "./pages/leads/UpdateLead";
import PipelineList from "./pages/leads/PipelineList";
import PipelineCreate from "./pages/leads/PipelineCreate";
import LeadDetails from "./pages/leads/LeadDetails";

// taxes
import TaxesList from "./pages/taxes/TaxesList";
import CreateTax from "./pages/taxes/CreateTax";
import UpdateTax from "./pages/taxes/UpdateTax";

// taxes
import EmployeeList from "./pages/employees/EmployeeList";

// customers
import CustomersList from "./pages/customers/CustomersList";
import CreateCustomer from "./pages/customers/CreateCustomer";
import UpdateCustomer from "./pages/customers/UpdateCustomer";

// banks
import BanksList from "./pages/banks/BanksList";
import CreateBank from "./pages/banks/CreateBank";
import UpdateBank from "./pages/banks/UpdateBank";

// invoices
import InvoicesList from  "./pages/invoices/InvoicesList";
import CreateInvoice from "./pages/invoices/CreateInvoice";
import UpdateInvoice from "./pages/invoices/UpdateInvoice";

// others
import Setting from "./pages/others/Setting";
import Profile from "./pages/others/Profile";
import NotFound from "./pages/others/NotFound";

// Auth pages
import Login from  "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OTP from "./pages/auth/OTP";
import ResetPassword from "./pages/auth/ResetPassword";

// react imports css files
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
// react toastify css file

// without auth pages
import Form1 from "./pages/forms/Form1";
import ViewInvoice from "./pages/invoices/ViewInvoice";

import EmployeeInvite from "./pages/employees/InviteEmployee";

// transactions
import TransactionsList from "./pages/transactions/TransactionsList";
import CreateTransaction from "./pages/transactions/CreateTransaction";
import UpdateTransaction from "./pages/transactions/UpdateTransaction";

// notifications
import Notifications from "./pages/notifications/Notifications";
import CreateEmployee from "./pages/employees/CreateEmployee";
import UpdateEmployee from "./pages/employees/UpdateEmployee";
import PipelineUpdate from "./pages/leads/PipelineUpdate";


export default function App() {
  return (
    <Routes>
      {/* ========== Public Routes ========== */}
      <Route index element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<OTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />


      <Route path="/form/form1/:groupId/:groupToken" element={<Form1 />} />
      <Route path="/invoice/view" element={<ViewInvoice/>} />
      <Route path="/invite" element={<EmployeeInvite/>} />

      {/* ========== Protected Routes ========== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          {/* leads */}
          <Route path="leads" element={<LeadList />} />
          <Route path="pipelines" element={<PipelineList />} />
          <Route path="pipeline/create" element={<PipelineCreate />} />
          <Route path="pipeline/update" element={<PipelineUpdate />} />
          <Route path="lead/create" element={<CreateLead />} />
          <Route path="lead/update" element={<UpdateLead />} />
          <Route path="lead/details" element={<LeadDetails />} />

          {/* employees */}
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employee/create" element={<CreateEmployee />} />
          <Route path="employee/update" element={<UpdateEmployee />} />

          {/* Banks */}
          <Route path="banks" element={<BanksList />} />
          <Route path="bank/create" element={<CreateBank />} />
          <Route path="bank/update" element={<UpdateBank />} />

          {/* Taxes */}
          <Route path="taxes" element={<TaxesList />} />
          <Route path="tax/create" element={<CreateTax />} />
          <Route path="tax/update" element={<UpdateTax />} />

          {/* invoices */}
          <Route path="invoices" element={<InvoicesList />} />
          <Route path="invoice/create" element={<CreateInvoice />} />
          <Route path="invoice/update" element={<UpdateInvoice />} />

           {/* invoices */}
           <Route path="transactions" element={<TransactionsList />} />
          <Route path="transaction/create" element={<CreateTransaction />} />
          <Route path="transaction/update" element={<UpdateTransaction />} />

          {/* Payments */}
          {/* <Route path="payments" element={<PaymentsList />} />
          <Route path="payment/create" element={<CreatePayment />} />
          <Route path="payment/update" element={<UpdatePayment />} /> */}

          {/* Customers */}
          <Route path="customers" element={<CustomersList />} />
          <Route path="customer/create" element={<CreateCustomer />} />
          <Route path="customer/update" element={<UpdateCustomer />} />

          {/* others */}
          <Route path="settings" element={<Setting />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications/>} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
