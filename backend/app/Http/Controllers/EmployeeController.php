<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Type;
use App\Helpers\AccessHelper;
use App\Helpers\HierarchyHelper;
use Carbon\Carbon;
use Exception;
// use Illuminate\Container\Attributes\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class EmployeeController extends Controller
{
    /* =====================================================
     * STATUS MAPPING
     * ===================================================== */
    protected function uiToDbStatusMap(): array
    {
        return [
            'Active'     => 'active',
            'Inactive'   => 'inactive',
            'On Leave'   => 'pending',
            'Terminated' => 'suspended',

            // allow DB values directly
            'active'     => 'active',
            'inactive'   => 'inactive',
            'pending'    => 'pending',
            'suspended'  => 'suspended',
        ];
    }

    protected function mapStatusInputToDb(?string $input): ?string
    {
        if (!$input) return null;
        return $this->uiToDbStatusMap()[$input] ?? null;
    }

    protected function mapDbStatusToUi(?string $dbStatus): string
    {
        return [
            'active'    => 'Active',
            'inactive'  => 'Inactive',
            'pending'   => 'On Leave',
            'suspended' => 'Terminated',
        ][$dbStatus] ?? '';
    }

    /* =====================================================
     * INTERNAL: APPLY EMPLOYEE SCOPE
     * ===================================================== */
    protected function applyEmployeeScope(
        Request $request,
        string $endpoint,
        string $method,
        ?int $targetId = null
    ) {
        $auth = $request->user();

        // 🚫 never allow self
        if ($targetId && $targetId === $auth->id) {
            abort(403, 'Self action is not allowed');
        }

        $access = AccessHelper::getAccessLevel(
            $auth->id,
            $endpoint,
            $method
        );
        Log::error("get you error ");
        Log::error($access);
        if ($access === 'self' || !$access) {
            abort(403, 'Permission denied');
        }

        $query = User::query()->where('id', '!=', $auth->id);

        if ($access === 'hierarchy') {
            $ids = HierarchyHelper::getUserAndDescendants($auth->id);
            $query->whereIn('id', $ids)->where('id', '!=', $auth->id);
        }

        return $query;
    }

    /* =====================================================
     * GET /employees
     * ===================================================== */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = $this->applyEmployeeScope(
                $request,
                '/api/employees',
                'GET'
            );

            if ($search = trim($request->get('search', ''))) {
                $query->where(
                    fn($q) =>
                    $q->where('name', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                        ->orWhere('username', 'like', "%$search%")
                );
            }

            if ($phone = trim($request->get('phone', ''))) {
                $query->where('phone', 'like', "%$phone%");
            }

            if ($status = $request->get('status')) {
                if ($db = $this->mapStatusInputToDb($status)) {
                    $query->where('status', $db);
                }
            }

            if ($request->boolean('with_trashed')) {
                $query->withTrashed();
            }

            $data = $query
                ->latest('id')
                ->paginate((int) $request->get('per_page', 10));

            return response()->json([
                'data' => $data->items(),
                'total' => $data->total(),
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch employees',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /* =====================================================
     * POST /employees
     * ===================================================== */
    public function store(Request $request): JsonResponse
    {
        $this->applyEmployeeScope(
            $request,
            '/api/employees',
            'POST'
        );

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'status' => Rule::in(['active', 'inactive', 'pending', 'suspended']),
        ]);

        DB::transaction(function () use ($data, $request) {
            User::create([
                ...$data,
                'password' => bcrypt($data['password']),
                'created_by' => $request->user()->id,
            ]);
        });

        return response()->json(['message' => 'Employee created'], 201);
    }

    /* =====================================================
     * GET /employees/{id}
     * ===================================================== */
    public function show(Request $request, $id): JsonResponse
    {
        $query = $this->applyEmployeeScope(
            $request,
            '/api/employees/{id}',
            'GET',
            (int)$id
        )->withTrashed();

        $user = $query->where('id', $id)->firstOrFail();

        $data = $user->toArray();
        $data['status'] = $this->mapDbStatusToUi($user->status);
        $data['isBan'] = (bool) $user->is_banned;

        return response()->json($data);
    }

    /* =====================================================
     * PATCH /employees/{id}
     * ===================================================== */
    public function update(Request $request, $id): JsonResponse
    {
        $query = $this->applyEmployeeScope(
            $request,
            '/api/employees/{id}',
            'PUT',
            (int)$id
        );

        $user = $query->where('id', $id)->firstOrFail();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'status' => Rule::in(['active', 'inactive', 'pending', 'suspended']),
            'is_banned' => 'boolean',
        ]);

        DB::transaction(function () use ($user, $data, $request) {
            $user->update($data + ['updated_by' => $request->user()->id]);
        });

        return response()->json(['message' => 'Employee updated']);
    }

    /* =====================================================
     * DELETE /employees/{id}
     * ===================================================== */
    public function destroy(Request $request, $id): JsonResponse
    {
        $query = $this->applyEmployeeScope(
            $request,
            '/api/employees/{id}',
            'DELETE',
            (int)$id
        );

        $user = $query->where('id', $id)->firstOrFail();

        DB::transaction(function () use ($user, $request) {
            $user->update(['deleted_by' => $request->user()->id]);
            $user->delete();
        });

        return response()->json(['message' => 'Employee deleted']);
    }

    /* =====================================================
     * PATCH /employees/{id}/toggle-ban
     * ===================================================== */
    public function toggleBan(Request $request, $id): JsonResponse
    {

        $query = $this->applyEmployeeScope(
            $request,
            '/api/employees/{id}/toggle-ban',
            'PATCH',
            (int)$id
        );
        // return response()->json(['message' => 'Employee deleted']);

        $user = $query->where('id', $id)->firstOrFail();

        $user->update([
            'is_banned' => !$user->is_banned,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'id' => $user->id,
            'is_banned' => (bool) $user->is_banned,
        ]);
    }

    /* =====================================================
     * POST /employees/bulk-delete
     * ===================================================== */
    public function bulkDelete(Request $request): JsonResponse
    {
        $ids = array_diff((array) $request->input('ids', []), [$request->user()->id]);

        if (!$ids) {
            return response()->json(['message' => 'Invalid IDs'], 403);
        }

        $query = $this->applyEmployeeScope(
            $request,
            '/api/employees/bulk-delete',
            'POST'
        );

        DB::transaction(function () use ($query, $ids, $request) {
            $query->whereIn('id', $ids)
                ->update(['deleted_by' => $request->user()->id]);

            $query->whereIn('id', $ids)->delete();
        });

        return response()->json(['message' => 'Employees deleted']);
    }

    /* =====================================================
     * PUT /employees/bulk-status
     * ===================================================== */
    public function bulkStatus(Request $request): JsonResponse
    {
        $ids = array_diff((array) $request->input('ids', []), [$request->user()->id]);
        $status = $this->mapStatusInputToDb($request->input('status'));

        if (!$ids || !$status) {
            return response()->json(['message' => 'Invalid input'], 400);
        }

        $query = $this->applyEmployeeScope(
            $request,
            '/api/employees/bulk-status',
            'POST'
        );

        $query->whereIn('id', $ids)->update([
            'status' => $status,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Status updated']);
    }

    /* =====================================================
     * POST /employees/quick-assign
     * ===================================================== */
    public function quickAssignType(Request $request): JsonResponse
    {
        $this->applyEmployeeScope(
            $request,
            '/api/employees/quick-assign',
            'POST'
        );

        $data = $request->validate([
            'username' => 'required',
            'email' => 'required|email',
            'type_id' => 'required|exists:types,id',
        ]);

        DB::beginTransaction();
        try {
            $type = Type::findOrFail($data['type_id']);

            $user = User::where('username', $data['username'])
                ->orWhere('email', $data['email'])
                ->first();


            if ($user) {
                return response()->json(['message' => 'user already exist'], 500);
            }

            $user = User::create([
                'name' => $data['username'],
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => bcrypt(Str::random(34)),
                'status' => 'pending',
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
                'remember_token' => Str::random(60),
                'remember_token_exp' => now()->addDays(3),
            ]);

            DB::table('type_user_transactions')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'type_id' => $type->id,
                    'revoked_at' => null,
                ],
                [
                    'assigned_by' => $request->user()->id,
                    'assigned_at' => now(),
                    'created_by' => $request->user()->id,
                    'updated_by' => $request->user()->id,
                ]
            );

            DB::commit();
            return response()->json(['message' => 'Assigned successfully', 'remember_token' => $user->remember_token, 'user' => $user], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }


    public function acceptInvite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'    => 'required|string',
            'name'     => 'required|string|max:255',
            'phone'    => 'nullable|string|max:45',
            'dob'      => 'nullable|date',
            'gender'   => ['nullable', Rule::in(['male', 'female'])],
            'password' => 'required|string|min:6',
        ]);

        DB::beginTransaction();
        try {
            /** @var User|null $user */
            $user = User::where('remember_token', $data['token'])->first();

            // ❌ invalid token
            if (!$user) {
                return response()->json([
                    'message' => 'Invalid invite token',
                ], 400);
            }

            // ❌ token expired
            if (
                $user->remember_token_exp &&
                Carbon::now()->greaterThan($user->remember_token_exp)
            ) {
                return response()->json([
                    'message' => 'Invite link has expired',
                ], 400);
            }

            // ❌ already activated
            if ($user->status !== 'pending') {
                return response()->json([
                    'message' => 'Invite already used',
                ], 400);
            }

            // ✅ activate account
            $user->name     = $data['name'];
            $user->phone    = $data['phone'] ?? null;
            $user->dob      = $data['dob'] ?? null;
            $user->gender   = $data['gender'] ?? null;
            $user->password = Hash::make($data['password']);
            $user->status   = 'active';

            // 🔥 invalidate invite token
            $user->remember_token = null;
            $user->remember_token_exp = null;

            // self-activation audit
            $user->updated_by = $user->id;

            $user->save();

            DB::commit();

            return response()->json([
                'message' => 'Employee account activated successfully',
                'data' => [
                    'id'       => $user->id,
                    'username' => $user->username,
                    'email'    => $user->email,
                    'status'   => 'active',
                ],
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to activate account',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
