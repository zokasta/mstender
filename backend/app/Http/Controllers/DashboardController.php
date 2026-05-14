<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\User;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | MAIN DASHBOARD STATS
    |--------------------------------------------------------------------------
    */

    public function stats(Request $request)
    {
        $user = $request->user();

        if ($user->type === 'intern') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | SUPERADMIN
        |--------------------------------------------------------------------------
        */

        if ($user->type === 'superadmin') {

            $totalLeads = Lead::count();

            $totalRevenue = Invoice::where('status', 'paid')
                ->sum('paid_amount');

            $partiallyPaid = Invoice::where('status', 'partial')
                ->sum('paid_amount');

            $invoiceCount = Invoice::count();

            return response()->json([
                'success' => true,

                'data' => [
                    'total_leads' => $totalLeads,

                    'revenue' => $totalRevenue + $partiallyPaid,

                    'invoice_count' => $invoiceCount,
                ]
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | SALES
        |--------------------------------------------------------------------------
        */

        $totalLeads = Lead::where('created_by', $user->id)
            ->count();

        $totalRevenue = Invoice::where('created_by', $user->id)
            ->where('status', 'paid')
            ->sum('paid_amount');

        $partiallyPaid = Invoice::where('created_by', $user->id)
            ->where('status', 'partial')
            ->sum('paid_amount');

        $invoiceCount = Invoice::where('created_by', $user->id)
            ->count();

        return response()->json([
            'success' => true,

            'data' => [
                'total_leads' => $totalLeads,

                'revenue' => $totalRevenue + $partiallyPaid,

                'invoice_count' => $invoiceCount,
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | TOP EMPLOYEES
    |--------------------------------------------------------------------------
    */

    public function topEmployees(Request $request)
    {
        $user = $request->user();

        if ($user->type !== 'superadmin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        $employees = User::select(
            'users.id',
            'users.name',
            DB::raw('SUM(invoices.paid_amount) as total_amount')
        )
            ->join('invoices', 'invoices.created_by', '=', 'users.id')

            ->where(function ($q) {
                $q->where('invoices.status', 'paid')
                    ->orWhere('invoices.status', 'partial');
            })

            ->groupBy('users.id', 'users.name')

            ->orderByDesc('total_amount')

            ->limit(5)

            ->get();

        return response()->json([
            'success' => true,
            'data' => $employees,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | LEAD SOURCE TRAFFIC
    |--------------------------------------------------------------------------
    */

    public function trafficSources(Request $request)
    {
        $user = $request->user();

        if ($user->type !== 'superadmin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        $sources = Lead::select(
            'source',
            DB::raw('COUNT(*) as total')
        )

            ->whereNotNull('source')

            ->groupBy('source')

            ->orderByDesc('total')

            ->get();

        return response()->json([
            'success' => true,
            'data' => $sources,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | REVENUE CHART
    |--------------------------------------------------------------------------
    */

    public function revenueChart(Request $request)
    {
        $user = $request->user();

        if ($user->type === 'intern') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        $query = Invoice::query();

        if ($user->type === 'sales') {
            $query->where('created_by', $user->id);
        }

        $monthly = $query
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(paid_amount) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $monthly,
        ]);
    }


    /*
|--------------------------------------------------------------------------
| INVOICE STATUS CHART
|--------------------------------------------------------------------------
*/

    public function invoiceStatus(Request $request)
    {
        $user = $request->user();

        if ($user->type === 'intern') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
            ], 403);
        }

        $query = Invoice::query();

        /*
    |--------------------------------------------------------------------------
    | SALES USER CAN ONLY SEE OWN DATA
    |--------------------------------------------------------------------------
    */

        if ($user->type === 'sales') {
            $query->where('created_by', $user->id);
        }

        $statuses = $query
            ->select(
                'status',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('status')
            ->get();

        /*
    |--------------------------------------------------------------------------
    | PIE CHART FORMAT
    |--------------------------------------------------------------------------
    */

        $colors = [
            'paid' => '#22c55e',
            'pending' => '#f59e0b',
            'draft' => '#64748b',
            'unpaid' => '#ef4444',
            'partially paid' => '#3b82f6',
            'overpaid' => '#8b5cf6',
            'cancelled' => '#6b7280',
            'overdue' => '#dc2626',
            'uncollectible' => '#111827',
        ];

        $data = $statuses->values()->map(function ($item, $index) use ($colors) {
            return [
                'id' => $index,
                'value' => (int) $item->total,
                'label' => ucfirst($item->status),
                'color' => $colors[$item->status] ?? '#2f69ca',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
