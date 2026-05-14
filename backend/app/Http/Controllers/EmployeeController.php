<?php

namespace App\Http\Controllers;

use App\Models\User;

use Carbon\Carbon;
use Exception;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /* =====================================================
     * ONLY SUPERADMIN
     * ===================================================== */
    protected function ensureSuperadmin(Request $request)
    {
        if ($request->user()->type !== 'superadmin') {

            abort(403, 'Only superadmin allowed');
        }
    }

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

            // direct DB values
            'active'     => 'active',
            'inactive'   => 'inactive',
            'pending'    => 'pending',
            'suspended'  => 'suspended',
        ];
    }

    protected function mapStatusInputToDb(?string $input): ?string
    {

        if (!$input) return null;

        return $this->uiToDbStatusMap()[$input]
            ?? null;
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
     * GET /employees
     * ===================================================== */
    public function index(Request $request): JsonResponse
    {

        try {

            $this->ensureSuperadmin(
                $request
            );

            $query = User::query();

            // 🔍 Search
            if (
                $search = trim(
                    $request->get(
                        'search',
                        ''
                    )
                )
            ) {

                $query->where(

                    fn($q) =>

                    $q->where(
                        'name',
                        'like',
                        "%$search%"
                    )

                        ->orWhere(
                            'email',
                            'like',
                            "%$search%"
                        )

                        ->orWhere(
                            'username',
                            'like',
                            "%$search%"
                        )
                );
            }

            // 📞 Phone
            if (
                $phone = trim(
                    $request->get(
                        'phone',
                        ''
                    )
                )
            ) {

                $query->where(
                    'phone',
                    'like',
                    "%$phone%"
                );
            }

            // 📌 Status
            if (
                $status = $request->get(
                    'status'
                )
            ) {

                if (
                    $db = $this
                    ->mapStatusInputToDb(
                        $status
                    )
                ) {

                    $query->where(
                        'status',
                        $db
                    );
                }
            }

            // 🗑 Trashed
            if (
                $request->boolean(
                    'with_trashed'
                )
            ) {

                $query->withTrashed();
            }

            $data = $query

                ->latest('id')

                ->paginate(

                    (int) $request->get(
                        'per_page',
                        10
                    )
                );

            return response()->json([

                'data' => $data->items(),

                'total' => $data->total(),

                'current_page' =>
                $data->currentPage(),

                'last_page' =>
                $data->lastPage(),
            ]);
        } catch (Exception $e) {

            return response()->json([

                'message' =>
                'Failed to fetch employees',

                'error' =>
                $e->getMessage(),

            ], 500);
        }
    }

    /* =====================================================
     * POST /employees
     * ===================================================== */
    public function store(Request $request): JsonResponse
    {

        $this->ensureSuperadmin(
            $request
        );

        $data = $request->validate([

            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'username' => [
                'required',
                'unique:users,username'
            ],

            'email' => [
                'required',
                'email',
                'unique:users,email'
            ],

            'password' => [
                'required',
                'min:6'
            ],

            'phone' => [
                'nullable',
                'string'
            ],

            'gender' => [
                'nullable',
                Rule::in([
                    'male',
                    'female'
                ])
            ],

            'dob' => [
                'nullable',
                'date'
            ],

            'type' => [
                'required',
                Rule::in([
                    'superadmin',
                    'sales',
                    'intern'
                ])
            ],

            'status' => [
                'required',
                Rule::in([
                    'active',
                    'inactive',
                    'pending',
                    'suspended'
                ])
            ],
        ]);

        DB::transaction(function ()
        use (
            $data,
            $request
        ) {

            User::create([

                ...$data,

                'password' => bcrypt(
                    $data['password']
                ),

                'created_by' =>
                $request->user()->id,
            ]);
        });

        return response()->json([

            'message' =>
            'Employee created'

        ], 201);
    }

    /* =====================================================
     * GET /employees/{id}
     * ===================================================== */
    public function show(Request $request, $id): JsonResponse
    {

        $this->ensureSuperadmin(
            $request
        );

        $user = User::withTrashed()

            ->where(
                'id',
                $id
            )

            ->firstOrFail();

        $data = $user->toArray();

        $data['status'] =
            $this->mapDbStatusToUi(
                $user->status
            );

        $data['isBan'] =
            (bool) $user->is_banned;

        return response()->json(
            $data
        );
    }

    /* =====================================================
     * PATCH /employees/{id}
     * ===================================================== */
    public function update(Request $request, $id): JsonResponse
    {

        $this->ensureSuperadmin(
            $request
        );

        $user = User::where(
            'id',
            $id
        )->firstOrFail();

        // 🚫 prevent self role change
        if (
            $user->id ===
            $request->user()->id
        ) {

            return response()->json([

                'message' =>
                'Self update restricted'

            ], 403);
        }

        $data = $request->validate([

            'name' => [
                'sometimes',
                'string',
                'max:255'
            ],

            'email' => [
                'sometimes',
                'email',

                Rule::unique(
                    'users'
                )->ignore(
                    $user->id
                )
            ],

            'phone' => [
                'nullable',
                'string'
            ],

            'gender' => [
                'nullable',

                Rule::in([
                    'male',
                    'female'
                ])
            ],

            'dob' => [
                'nullable',
                'date'
            ],

            'type' => [
                'sometimes',

                Rule::in([
                    'superadmin',
                    'sales',
                    'intern'
                ])
            ],

            'status' => [
                'sometimes',

                Rule::in([
                    'active',
                    'inactive',
                    'pending',
                    'suspended'
                ])
            ],

            'is_banned' => [
                'boolean'
            ],
        ]);

        DB::transaction(function ()
        use (
            $user,
            $data,
            $request
        ) {

            $user->update(

                $data + [

                    'updated_by' =>
                    $request->user()->id
                ]
            );
        });

        return response()->json([

            'message' =>
            'Employee updated'
        ]);
    }

    /* =====================================================
     * DELETE /employees/{id}
     * ===================================================== */
    public function destroy(Request $request, $id): JsonResponse
    {

        $this->ensureSuperadmin(
            $request
        );

        $user = User::where(
            'id',
            $id
        )->firstOrFail();

        // 🚫 prevent self delete
        if (
            $user->id ===
            $request->user()->id
        ) {

            return response()->json([

                'message' =>
                'Self delete not allowed'

            ], 403);
        }

        DB::transaction(function ()
        use (
            $user,
            $request
        ) {

            $user->update([

                'deleted_by' =>
                $request->user()->id
            ]);

            $user->delete();
        });

        return response()->json([

            'message' =>
            'Employee deleted'
        ]);
    }

    /* =====================================================
     * PATCH /employees/{id}/toggle-ban
     * ===================================================== */
    public function toggleBan(Request $request, $id): JsonResponse
    {

        $this->ensureSuperadmin(
            $request
        );

        $user = User::where(
            'id',
            $id
        )->firstOrFail();

        // 🚫 prevent self ban
        if (
            $user->id ===
            $request->user()->id
        ) {

            return response()->json([

                'message' =>
                'Self ban not allowed'

            ], 403);
        }

        $user->update([

            'is_banned' =>
            !$user->is_banned,

            'updated_by' =>
            $request->user()->id,
        ]);

        return response()->json([

            'id' =>
            $user->id,

            'is_banned' =>
            (bool) $user->is_banned,
        ]);
    }

    /* =====================================================
     * POST /employees/bulk-delete
     * ===================================================== */
    public function bulkDelete(Request $request): JsonResponse
    {

        $this->ensureSuperadmin(
            $request
        );

        $ids = array_diff(

            (array) $request->input(
                'ids',
                []
            ),

            [$request->user()->id]
        );

        if (!$ids) {

            return response()->json([

                'message' =>
                'Invalid IDs'

            ], 403);
        }

        DB::transaction(function ()
        use (
            $ids,
            $request
        ) {

            User::whereIn(
                'id',
                $ids
            )->update([

                'deleted_by' =>
                $request->user()->id
            ]);

            User::whereIn(
                'id',
                $ids
            )->delete();
        });

        return response()->json([

            'message' =>
            'Employees deleted'
        ]);
    }

    /* =====================================================
     * PUT /employees/bulk-status
     * ===================================================== */
    public function bulkStatus(Request $request): JsonResponse
    {
        $this->ensureSuperadmin(
            $request
        );

        $ids = array_diff(

            (array) $request->input(
                'ids',
                []
            ),

            [$request->user()->id]
        );

        $status = $this
            ->mapStatusInputToDb(
                $request->input(
                    'status'
                )
            );

        if (
            !$ids ||
            !$status
        ) {

            return response()->json([

                'message' =>
                'Invalid input'

            ], 400);
        }

        User::whereIn(
            'id',
            $ids
        )->update([

            'status' =>
            $status,

            'updated_by' =>
            $request->user()->id,
        ]);

        return response()->json([

            'message' =>
            'Status updated'
        ]);
    }


    /* =====================================================
    * POST /employees/quick-assign
    * ===================================================== */
    public function quickAssign(Request $request): JsonResponse
    {

        // ✅ Only superadmin
        if (
            $request->user()->type !==
            'superadmin'
        ) {

            return response()->json([
                'message' =>
                'Only superadmin allowed'
            ], 403);
        }

        $data = $request->validate([

            'username' => [
                'required',
                'string',
                'max:255',
                'unique:users,username'
            ],

            'email' => [
                'required',
                'email',
                'unique:users,email'
            ],

            'type' => [
                'required',

                Rule::in([
                    'superadmin',
                    'sales',
                    'intern'
                ])
            ],
        ]);

        DB::beginTransaction();

        try {

            $user = User::create([

                'name' => $data['username'],

                'username' =>
                $data['username'],

                'email' =>
                $data['email'],

                // random temp password
                'password' => bcrypt(
                    Str::random(34)
                ),

                'type' =>
                $data['type'],

                'status' => 'pending',

                'assigned_by' =>
                $request->user()->id,

                'assigned_at' => now(),

                // invite token
                'remember_token' =>
                Str::random(60),

                'remember_token_exp' =>
                now()->addDays(3),

                'created_by' =>
                $request->user()->id,
            ]);

            DB::commit();

            return response()->json([

                'message' =>
                'Invitation created successfully',

                'invite_token' =>
                $user->remember_token,
                // 'remember_token'=>$user->remember_token,
                'invite_link' =>

                url(
                    "/accept-invite/{$user->remember_token}"
                ),

                'user' => $user,

            ], 201);
        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([

                'message' =>
                $e->getMessage()

            ], 500);
        }
    }

    /* =====================================================
    * ACCEPT INVITE
    * ===================================================== */
    public function acceptInvite(Request $request): JsonResponse
    {

        $data = $request->validate([

            'token' => [
                'required',
                'string'
            ],

            'name' => [
                'required',
                'string',
                'max:255'
            ],

            'phone' => [
                'nullable',
                'string',
                'max:45'
            ],

            'dob' => [
                'nullable',
                'date'
            ],

            'gender' => [
                'nullable',

                Rule::in([
                    'male',
                    'female'
                ])
            ],

            'password' => [
                'required',
                'string',
                'min:6'
            ],
        ]);

        DB::beginTransaction();

        try {

            $user = User::where(
                'remember_token',
                $data['token']
            )->first();

            // ❌ invalid token
            if (!$user) {

                return response()->json([

                    'message' =>
                    'Invalid invite token',

                ], 400);
            }

            // ❌ expired
            if (

                $user->remember_token_exp &&

                Carbon::now()->greaterThan(
                    $user->remember_token_exp
                )
            ) {

                return response()->json([

                    'message' =>
                    'Invite link expired',

                ], 400);
            }

            // ❌ already used
            if (
                $user->status !==
                'pending'
            ) {

                return response()->json([

                    'message' =>
                    'Invite already used',

                ], 400);
            }

            // ✅ activate employee
            $user->name =
                $data['name'];

            $user->phone =
                $data['phone']
                ?? null;

            $user->dob =
                $data['dob']
                ?? null;

            $user->gender =
                $data['gender']
                ?? null;

            $user->password =
                Hash::make(
                    $data['password']
                );

            $user->status =
                'active';

            // invalidate token
            $user->remember_token =
                null;

            $user->remember_token_exp =
                null;

            $user->updated_by =
                $user->id;

            $user->save();

            DB::commit();

            return response()->json([

                'message' =>
                'Employee account activated successfully',

                'data' => [

                    'id' =>
                    $user->id,

                    'username' =>
                    $user->username,

                    'email' =>
                    $user->email,

                    'type' =>
                    $user->type,

                    'status' =>
                    'active',
                ],
            ], 200);
        } catch (Exception $e) {

            DB::rollBack();

            return response()->json([

                'message' =>
                'Failed to activate account',

                'error' =>
                $e->getMessage(),

            ], 500);
        }
    }

    /* =====================================================
    * POST /employees/bulk-ban
    * ===================================================== */
    public function bulkBan( Request $request ): JsonResponse 
    {

        // ✅ Only superadmin
        if (
            $request->user()->type !==
            'superadmin'
        ) {

            return response()->json([

                'message' =>
                'Only superadmin allowed'

            ], 403);
        }

        $data = $request->validate([

            'ids' => [
                'required',
                'array',
                'min:1'
            ],

            'ids.*' => [
                'exists:users,id'
            ],

            'is_banned' => [
                'required',
                'boolean'
            ],
        ]);

        // 🚫 prevent self ban
        $ids = array_diff(

            $data['ids'],

            [$request->user()->id]
        );

        if (!$ids) {

            return response()->json([

                'message' =>
                'Cannot ban yourself'

            ], 400);
        }

        User::whereIn(
            'id',
            $ids
        )->update([

            'is_banned' =>
            $data['is_banned'],

            'updated_by' =>
            $request->user()->id,
        ]);

        return response()->json([

            'success' => true,

            'message' =>
            $data['is_banned']
                ? 'Employees banned successfully'
                : 'Employees unbanned successfully',
        ]);
    }
}
