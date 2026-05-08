<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Lead;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Helpers\AccessHelper;
use App\Helpers\HierarchyHelper;
use App\Models\Invoice;

class DashboardController extends Controller
{
    /* =====================================================
     * LEADS COUNT
     * ===================================================== */
    public function leadsCount(Request $request)
    {
        $user = $request->user();

        $endpoint = '/api/dashboard/leads-count';
        $method = 'GET';

        $accessLevel = AccessHelper::getAccessLevel(
            $user->id,
            $endpoint,
            $method
        );

        if (!$accessLevel) {
            return response()->json([
                'message' => 'You do not have permission to access leads dashboard',
                'status_key' => 'no-permission-api-endpoint'
            ], 403);
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $query = Lead::whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        /* 🔐 Apply Access Scope */
        if ($accessLevel === 'self') {
            $query->where('created_by', $user->id);
        } elseif ($accessLevel === 'hierarchy') {
            $userIds = HierarchyHelper::getUserAndDescendants($user->id);
            $query->whereIn('created_by', $userIds);
        } elseif ($accessLevel !== 'full') {
            return response()->json([
                'message' => 'Invalid access level',
                'status_key' => 'invalid-access-level'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $now->format('F'),
                'year' => $now->year,
                'start_date' => $startOfMonth->toDateString(),
                'end_date' => $endOfMonth->toDateString(),
                'value' => $query->count(),
            ]
        ]);
    }

    /* =====================================================
     * CUSTOMERS SUMMARY
     * ===================================================== */
    public function customersCount(Request $request)
    {
        $user = $request->user();

        $endpoint = '/api/dashboard/customers-count';
        $method = 'GET';

        $accessLevel = AccessHelper::getAccessLevel(
            $user->id,
            $endpoint,
            $method
        );

        if (!$accessLevel) {
            return response()->json([
                'message' => 'You do not have permission to access customers dashboard',
                'status_key' => 'no-permission-api-endpoint'
            ], 403);
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $query = Customer::whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        /* 🔐 Apply Access Scope */
        if ($accessLevel === 'self') {
            $query->where('created_by', $user->id);
        } elseif ($accessLevel === 'hierarchy') {
            $userIds = HierarchyHelper::getUserAndDescendants($user->id);
            $query->whereIn('created_by', $userIds);
        } elseif ($accessLevel !== 'full') {
            return response()->json([
                'message' => 'Invalid access level',
                'status_key' => 'invalid-access-level'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $now->format('F'),
                'year' => $now->year,
                'start_date' => $startOfMonth->toDateString(),
                'end_date' => $endOfMonth->toDateString(),
                'value' => $query->count(),
            ]
        ]);
    }

    /* =====================================================
    * INVOICE SUMMARY
    * ===================================================== */
    public function invoicesCount(Request $request)
    {
        $user = $request->user();

        $endpoint = '/api/dashboard/invoices-count';
        $method = 'GET';

        $accessLevel = AccessHelper::getAccessLevel(
            $user->id,
            $endpoint,
            $method
        );

        if (!$accessLevel) {
            return response()->json([
                'message' => 'You do not have permission to access invoices dashboard',
                'status_key' => 'no-permission-api-endpoint'
            ], 403);
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $query = Invoice::whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        /* 🔐 Apply Access Scope */
        if ($accessLevel === 'self') {

            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                    ->orWhere('created_by', $user->id);
            });
        } elseif ($accessLevel === 'hierarchy') {

            $userIds = HierarchyHelper::getUserAndDescendants($user->id);

            $query->whereIn('assigned_to', $userIds);
        } elseif ($accessLevel !== 'full') {

            return response()->json([
                'message' => 'Invalid access level',
                'status_key' => 'invalid-access-level'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $now->format('F'),
                'year' => $now->year,
                'start_date' => $startOfMonth->toDateString(),
                'end_date' => $endOfMonth->toDateString(),

                // Total invoices
                'value' => (clone $query)->count(),

                // Status based counts
                // 'paid' => (clone $query)->where('status', 'paid')->count(),
                // 'unpaid' => (clone $query)->where('status', 'unpaid')->count(),
                // 'pending' => (clone $query)->where('status', 'pending')->count(),
                // 'overdue' => (clone $query)->where('status', 'overdue')->count(),

                // // Financial summary
                // 'total_amount' => (clone $query)->sum('total'),
                // 'paid_amount' => (clone $query)->sum('paid_amount'),
                // 'due_amount' => (clone $query)->sum('due_amount'),
            ]
        ]);
    }

    /* =====================================================
    * REVENUE SUMMARY
    * ===================================================== */
    public function revenueCount(Request $request)
    {
        $user = $request->user();

        $endpoint = '/api/dashboard/revenues-count';
        $method = 'GET';

        $accessLevel = AccessHelper::getAccessLevel(
            $user->id,
            $endpoint,
            $method
        );

        if (!$accessLevel) {
            return response()->json([
                'message' => 'You do not have permission to access revenue dashboard',
                'status_key' => 'no-permission-api-endpoint'
            ], 403);
        }

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $query = Invoice::whereBetween('created_at', [$startOfMonth, $endOfMonth]);

        /* 🔐 Apply Access Scope */
        if ($accessLevel === 'self') {

            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                    ->orWhere('created_by', $user->id);
            });
        } elseif ($accessLevel === 'hierarchy') {

            $userIds = HierarchyHelper::getUserAndDescendants($user->id);
            $query->whereIn('assigned_to', $userIds);
        } elseif ($accessLevel !== 'full') {

            return response()->json([
                'message' => 'Invalid access level',
                'status_key' => 'invalid-access-level'
            ], 403);
        }

        $totalRevenue = (clone $query)->sum('total');
        $collectedRevenue = (clone $query)->sum('paid_amount');
        $pendingRevenue = (clone $query)->sum('due_amount');
        $paidInvoicesRevenue = (clone $query)
            ->where('status', 'paid')
            ->sum('total');

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $now->format('F'),
                'year' => $now->year,
                'start_date' => $startOfMonth->toDateString(),
                'end_date' => $endOfMonth->toDateString(),

                'value' => $totalRevenue,
                'collected_revenue' => $collectedRevenue,
                'pending_revenue' => $pendingRevenue,
                'paid_revenue' => $paidInvoicesRevenue,
            ]
        ]);
    }

    /* =====================================================
    * MONTHLY CUSTOMERS (Chart)
    * ===================================================== */
    public function monthlyCustomers(Request $request)
    {
        $user = $request->user();

        $endpoint = '/api/dashboard/monthly-customers-chart';
        $method = 'GET';

        $accessLevel = AccessHelper::getAccessLevel(
            $user->id,
            $endpoint,
            $method
        );

        if (!$accessLevel) {
            return response()->json([
                'message' => 'You do not have permission to access monthly customers dashboard',
                'status_key' => 'no-permission-api-endpoint'
            ], 403);
        }

        $year = now()->year;

        $query = Customer::whereYear('created_at', $year);

        /* 🔐 Apply Access Scope */
        if ($accessLevel === 'self') {
            $query->where('created_by', $user->id);
        } elseif ($accessLevel === 'hierarchy') {
            $userIds = HierarchyHelper::getUserAndDescendants($user->id);
            $query->whereIn('created_by', $userIds);
        } elseif ($accessLevel !== 'full') {
            return response()->json([
                'message' => 'Invalid access level',
                'status_key' => 'invalid-access-level'
            ], 403);
        }

        $monthlyData = $query
            ->selectRaw('MONTH(created_at) as month_number, COUNT(*) as total')
            ->groupByRaw('MONTH(created_at)')
            ->pluck('total', 'month_number')
            ->toArray();

        $formattedData = [];

        for ($month = 1; $month <= 12; $month++) {
            $formattedData[] = [
                'month' => \Carbon\Carbon::create()->month($month)->format('M'),
                'value' => $monthlyData[$month] ?? 0
            ];
        }

        return response()->json([
            'success' => true,
            'year' => $year,
            'data' => $formattedData
        ]);
    }
}
