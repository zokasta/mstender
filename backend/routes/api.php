<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LeadActivityController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\LeadNoteCommentController;
use App\Http\Controllers\LeadNoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\PipelineStageController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\TransactionController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/invoices/view', [InvoiceController::class, 'view']);
Route::post('/employees/accept-invite', [EmployeeController::class, 'acceptInvite']);

Route::middleware('auth:sanctum')->post('/heartbeat', function (Request $request) {

    $request->user()->update([
        'last_seen_at' => now(),
    ]);

    return response()->json([
        'status' => true
    ]);
});

Route::get('/test', function () {
    return response()->json([
        'message' => 'API working'
    ]);
});

Route::middleware('auth:sanctum')->post('/broadcasting/auth', function () {
    return Broadcast::auth(request());
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum', 'not.banned'])->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Pipelines
    |--------------------------------------------------------------------------
    */

    Route::prefix('pipelines')->group(function () {
        Route::get('/', [PipelineController::class, 'index']);
        Route::post('/', [PipelineController::class, 'store']);
        Route::get('/{id}', [PipelineController::class, 'show']);
        Route::put('/{id}', [PipelineController::class, 'store']);
        Route::delete('/{id}', [PipelineController::class, 'destroy']);
        Route::patch('/{id}/toggle-active', [PipelineController::class, 'toggleActive']);
        Route::post('/{id}/duplicate', [PipelineController::class, 'duplicate']);
        Route::post('/bulk-delete', [PipelineController::class, 'bulkDelete']);
        Route::post('/bulk-status', [PipelineController::class, 'bulkStatus']);
    });

    /*
    |--------------------------------------------------------------------------
    | Pipeline Stages
    |--------------------------------------------------------------------------
    */

    Route::prefix('pipeline-stages')->group(function () {
        Route::get('/pipeline/{pipeline_id}', [PipelineStageController::class, 'index']);
        Route::post('/', [PipelineStageController::class, 'store']);
        Route::put('/{id}', [PipelineStageController::class, 'update']);
        Route::delete('/{id}', [PipelineStageController::class, 'destroy']);
        Route::post('/reorder', [PipelineStageController::class, 'reorder']);
    });

    Route::prefix('lead-activities')->group(function () {
        Route::get('/', [LeadActivityController::class, 'index']);
        Route::get('/{id}', [LeadActivityController::class, 'show']);
        Route::post('/', [LeadActivityController::class, 'store']);
        Route::put('/{id}', [LeadActivityController::class, 'update']);
        Route::delete('/{id}', [LeadActivityController::class, 'destroy']);
        Route::post('/bulk-delete', [LeadActivityController::class, 'bulkDelete']);
    });
    /*
    |--------------------------------------------------------------------------
    | Leads
    |--------------------------------------------------------------------------
    */


    /*
    |--------------------------------------------------------------------------
    | PIPELINE STAGES
    |--------------------------------------------------------------------------
    */

    Route::post('/pipeline-stages', [PipelineStageController::class, 'store']);
    Route::put('/pipeline-stages/{id}', [PipelineStageController::class, 'update']);
    Route::delete('/pipeline-stages/{id}', [PipelineStageController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | ACTIVITIES
    |--------------------------------------------------------------------------
    */

    Route::post('/lead-activities', [LeadActivityController::class, 'store']);
    Route::delete('/lead-activities/{id}', [LeadActivityController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | NOTES
    |--------------------------------------------------------------------------
    */

    Route::get('/lead-notes/{lead_id}', [LeadNoteController::class, 'index']);
    Route::post('/lead-notes', [LeadNoteController::class, 'store']);
    Route::put('/lead-notes/{id}', [LeadNoteController::class, 'update']);
    Route::delete('/lead-notes/{id}', [LeadNoteController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | COMMENTS
    |--------------------------------------------------------------------------
    */

    Route::post('/lead-note-comments', [LeadNoteCommentController::class, 'store']);
    Route::put('/lead-note-comments/{id}', [LeadNoteCommentController::class, 'update']);
    Route::delete('/lead-note-comments/{id}', [LeadNoteCommentController::class, 'destroy']);


    Route::prefix('leads')->group(function () {
        Route::get('/', [LeadController::class, 'index']);
        Route::post('/', [LeadController::class, 'store']);
        Route::get('/{id}', [LeadController::class, 'show']);
        Route::put('/{id}', [LeadController::class, 'update']);
        Route::delete('/{id}', [LeadController::class, 'destroy']);
        Route::post('/change-stage', [LeadController::class, 'changeStage']);
        Route::post('/assign', [LeadController::class, 'assign']);
        Route::post('/bulk-delete', [LeadController::class, 'bulkDelete']);
        Route::post('/bulk-move', [LeadController::class, 'bulkMove']);
        Route::get('/export', [LeadController::class, 'export']);
    });

    /*
    |--------------------------------------------------------------------------
    | Lead Activities
    |--------------------------------------------------------------------------
    */

    // Route::prefix('lead-activities')->group(function () {
    //     Route::get('/{lead_id}', [LeadActivityController::class, 'index']);
    //     Route::post('/', [LeadActivityController::class, 'store']);
    //     Route::delete('/{id}', [LeadActivityController::class, 'destroy']);
    // });

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Route::prefix('customers')->group(function () {
        Route::post('/', [CustomerController::class, 'store']);
        Route::get('/', [CustomerController::class, 'index']);
        Route::get('/{id}', [CustomerController::class, 'show']);
        Route::put('/{id}', [CustomerController::class, 'update']);
        Route::delete('/{id}', [CustomerController::class, 'destroy']);
        Route::post('/bulk-delete', [CustomerController::class, 'bulkDelete']);
        Route::post('/bulk-status', [CustomerController::class, 'bulkStatus']);
    });

    /*
    |--------------------------------------------------------------------------
    | Invoices
    |--------------------------------------------------------------------------
    */

    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index']);
        Route::post('/', [InvoiceController::class, 'store']);
        Route::post('/bulk-delete', [InvoiceController::class, 'bulkDelete']);
        Route::post('/bulk-status', [InvoiceController::class, 'bulkStatus']);
        Route::post('/bulk-export', [InvoiceController::class, 'bulkExport']);
    });

    /*
    |--------------------------------------------------------------------------
    | Banks
    |--------------------------------------------------------------------------
    */

    Route::prefix('banks')->group(function () {
        Route::get('/', [BankController::class, 'index']);
        Route::post('/', [BankController::class, 'store']);
        Route::delete('/{id}', [BankController::class, 'destroy']);
        Route::patch('/{id}/status', [BankController::class, 'toggleStatus']);
        Route::get('/{id}', [BankController::class, 'show']);
        Route::put('/{id}', [BankController::class, 'update']);
        Route::post('/bulk-delete', [BankController::class, 'bulkDelete']);
        Route::post('/bulk-status', [BankController::class, 'bulkStatus']);
    });

    /*
    |--------------------------------------------------------------------------
    | Taxes
    |--------------------------------------------------------------------------
    */

    Route::prefix('taxes')->group(function () {
        Route::get('/', [TaxController::class, 'index']);
        Route::post('/', [TaxController::class, 'store']);
        Route::get('/{id}', [TaxController::class, 'show']);
        Route::put('/{id}', [TaxController::class, 'update']);
        Route::delete('/{id}', [TaxController::class, 'destroy']);
        Route::patch('/{id}/status', [TaxController::class, 'toggleStatus']);
        Route::post('/bulk-status', [TaxController::class, 'bulkStatus']);
        Route::post('/bulk-delete', [TaxController::class, 'bulkDelete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Employees
    |--------------------------------------------------------------------------
    */

    Route::prefix('employees')->group(function () {
        Route::get('/', [EmployeeController::class, 'index']);
        Route::post('/', [EmployeeController::class, 'store']);
        Route::get('/{id}', [EmployeeController::class, 'show']);
        Route::put('/{id}', [EmployeeController::class, 'update']);
        Route::delete('/{id}', [EmployeeController::class, 'destroy']);
        Route::post('/quick-assign', [EmployeeController::class, 'quickAssign']);
        Route::patch('/{id}/toggle-ban', [EmployeeController::class, 'toggleBan']);
        Route::post('/bulk-delete', [EmployeeController::class, 'bulkDelete']);
        Route::post('/bulk-status', [EmployeeController::class, 'bulkStatus']);
        Route::post('/bulk-ban', [EmployeeController::class, 'bulkBan']);
    });

    /*    
    |--------------------------------------------------------------------------
    | Transactions
    |--------------------------------------------------------------------------
    */

    Route::prefix('transactions')->group(function () {
        Route::get('/', [TransactionController::class, 'index']);
        Route::post('/', [TransactionController::class, 'store']);
        Route::get('/{id}', [TransactionController::class, 'show']);
        Route::put('/{id}', [TransactionController::class, 'update']);
        Route::delete('/{id}', [TransactionController::class, 'destroy']);
        Route::post('/attach', [TransactionController::class, 'attach']);
        Route::get('/type/{id}', [TransactionController::class, 'typeApis']);
        Route::get('/api/{id}', [TransactionController::class, 'apiTypes']);
        Route::post('/bulk-delete', [TransactionController::class, 'bulkDelete']);
    });

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/revenue-chart', [DashboardController::class, 'revenueChart']);
        Route::get('/top-employees', [DashboardController::class, 'topEmployees']);
        Route::get('/traffic-sources', [DashboardController::class, 'trafficSources']);
        Route::get('/monthly-customers-chart', [DashboardController::class, 'monthlyCustomers']);
        Route::get('/invoice-status', [DashboardController::class, 'invoiceStatus']);
    });


    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | Auth
    |--------------------------------------------------------------------------
    */

    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/settings', [AuthController::class, 'updateSettings']);
    });

    /*
    |--------------------------------------------------------------------------
    | User Profile
    |--------------------------------------------------------------------------
    */

    Route::get('/user/profile', [AuthController::class, 'show']);
    Route::post('/user/profile', [AuthController::class, 'update']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);
});
