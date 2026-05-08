<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Bank;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Setting;
use App\Models\Tax;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // ✅ Create sample data
            User::factory()->count(20)->create();

            Setting::factory()->count(10)->create();
            Tax::factory()->count(5)->create();
        
            Bank::factory()->count(50)->create();
          
            // Lead::factory()->count(10)->create();
            Bank::factory()->count(30)->create();
            Customer::factory()->count(50)->create();
            Invoice::factory()->count(10)->create();
            Transaction::factory()->count(50)->create();
            // ✅ Add a default admin user (for login)
            User::updateOrCreate(
                ['email' => 'admin@example.com'],
                [
                    'name' => 'Super Admin',
                    'username' => 'admin',
                    'phone' => '9999999999',
                    'password' => Hash::make('password'), // default password
                    'status' => 'active',
                    'type' => 'superadmin',
                    'is_banned' => false,
                    'profile_image' => "https://picsum.photos/200",
                ]
            );

            DB::commit();

            $this->command->info('✅ Database seeding completed successfully!');
        } catch (\Throwable $e) {
            DB::rollBack();

            Log::error('❌ Seeder failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            $this->command->error('❌ Seeding failed. All changes have been rolled back.');
            $this->command->error($e->getMessage());
        }
    }
}
