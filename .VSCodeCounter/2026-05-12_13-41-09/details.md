# Details

Date : 2026-05-12 13:41:09

Directory z:\\Projects\\mstender

Total : 242 files,  49064 codes, 2203 comments, 4163 blanks, all 55430 lines

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [README.md](/README.md) | Markdown | 2 | 0 | 1 | 3 |
| [backend/.github/workflows/issues.yml](/backend/.github/workflows/issues.yml) | YAML | 9 | 0 | 4 | 13 |
| [backend/.github/workflows/pull-requests.yml](/backend/.github/workflows/pull-requests.yml) | YAML | 9 | 0 | 4 | 13 |
| [backend/.github/workflows/tests.yml](/backend/.github/workflows/tests.yml) | YAML | 36 | 0 | 12 | 48 |
| [backend/.github/workflows/update-changelog.yml](/backend/.github/workflows/update-changelog.yml) | YAML | 10 | 0 | 4 | 14 |
| [backend/.styleci.yml](/backend/.styleci.yml) | YAML | 9 | 0 | 1 | 10 |
| [backend/CHANGELOG.md](/backend/CHANGELOG.md) | Markdown | 96 | 0 | 64 | 160 |
| [backend/README.md](/backend/README.md) | Markdown | 39 | 0 | 21 | 60 |
| [backend/app/Exports/InvoicesBulkExport.php](/backend/app/Exports/InvoicesBulkExport.php) | PHP | 26 | 0 | 14 | 40 |
| [backend/app/Http/Controllers/AuthController.php](/backend/app/Http/Controllers/AuthController.php) | PHP | 95 | 23 | 28 | 146 |
| [backend/app/Http/Controllers/BankController.php](/backend/app/Http/Controllers/BankController.php) | PHP | 254 | 41 | 87 | 382 |
| [backend/app/Http/Controllers/Controller.php](/backend/app/Http/Controllers/Controller.php) | PHP | 5 | 1 | 3 | 9 |
| [backend/app/Http/Controllers/CustomerController.php](/backend/app/Http/Controllers/CustomerController.php) | PHP | 273 | 26 | 101 | 400 |
| [backend/app/Http/Controllers/DashboardController.php](/backend/app/Http/Controllers/DashboardController.php) | PHP | 242 | 30 | 58 | 330 |
| [backend/app/Http/Controllers/EmployeeController.php](/backend/app/Http/Controllers/EmployeeController.php) | PHP | 721 | 58 | 268 | 1,047 |
| [backend/app/Http/Controllers/InvoiceController.php](/backend/app/Http/Controllers/InvoiceController.php) | PHP | 486 | 63 | 181 | 730 |
| [backend/app/Http/Controllers/InvoiceItemController.php](/backend/app/Http/Controllers/InvoiceItemController.php) | PHP | 7 | 1 | 4 | 12 |
| [backend/app/Http/Controllers/LeadActivityController.php](/backend/app/Http/Controllers/LeadActivityController.php) | PHP | 22 | 20 | 8 | 50 |
| [backend/app/Http/Controllers/LeadController.php](/backend/app/Http/Controllers/LeadController.php) | PHP | 136 | 0 | 38 | 174 |
| [backend/app/Http/Controllers/LeadCustomValueController.php](/backend/app/Http/Controllers/LeadCustomValueController.php) | PHP | 22 | 20 | 8 | 50 |
| [backend/app/Http/Controllers/NotificationController.php](/backend/app/Http/Controllers/NotificationController.php) | PHP | 43 | 0 | 17 | 60 |
| [backend/app/Http/Controllers/PipelineController.php](/backend/app/Http/Controllers/PipelineController.php) | PHP | 44 | 0 | 12 | 56 |
| [backend/app/Http/Controllers/PipelineStageController.php](/backend/app/Http/Controllers/PipelineStageController.php) | PHP | 58 | 0 | 14 | 72 |
| [backend/app/Http/Controllers/TaxController.php](/backend/app/Http/Controllers/TaxController.php) | PHP | 208 | 31 | 61 | 300 |
| [backend/app/Http/Controllers/TransactionController.php](/backend/app/Http/Controllers/TransactionController.php) | PHP | 518 | 54 | 194 | 766 |
| [backend/app/Http/Middlewares/CheckIfUserIsBanned.php](/backend/app/Http/Middlewares/CheckIfUserIsBanned.php) | PHP | 22 | 6 | 7 | 35 |
| [backend/app/Models/Bank.php](/backend/app/Models/Bank.php) | PHP | 38 | 0 | 9 | 47 |
| [backend/app/Models/Customer.php](/backend/app/Models/Customer.php) | PHP | 66 | 23 | 18 | 107 |
| [backend/app/Models/Invoice.php](/backend/app/Models/Invoice.php) | PHP | 46 | 0 | 10 | 56 |
| [backend/app/Models/InvoiceItem.php](/backend/app/Models/InvoiceItem.php) | PHP | 20 | 0 | 8 | 28 |
| [backend/app/Models/InvoiceTax.php](/backend/app/Models/InvoiceTax.php) | PHP | 21 | 0 | 6 | 27 |
| [backend/app/Models/Lead.php](/backend/app/Models/Lead.php) | PHP | 49 | 0 | 10 | 59 |
| [backend/app/Models/LeadActivity.php](/backend/app/Models/LeadActivity.php) | PHP | 18 | 0 | 4 | 22 |
| [backend/app/Models/LeadNote.php](/backend/app/Models/LeadNote.php) | PHP | 8 | 1 | 4 | 13 |
| [backend/app/Models/LeadNoteComment.php](/backend/app/Models/LeadNoteComment.php) | PHP | 8 | 1 | 4 | 13 |
| [backend/app/Models/Notification.php](/backend/app/Models/Notification.php) | PHP | 40 | 0 | 9 | 49 |
| [backend/app/Models/Pipeline.php](/backend/app/Models/Pipeline.php) | PHP | 19 | 0 | 5 | 24 |
| [backend/app/Models/PipelineStage.php](/backend/app/Models/PipelineStage.php) | PHP | 15 | 0 | 4 | 19 |
| [backend/app/Models/Setting.php](/backend/app/Models/Setting.php) | PHP | 35 | 0 | 10 | 45 |
| [backend/app/Models/Tax.php](/backend/app/Models/Tax.php) | PHP | 35 | 0 | 9 | 44 |
| [backend/app/Models/Transaction.php](/backend/app/Models/Transaction.php) | PHP | 35 | 0 | 8 | 43 |
| [backend/app/Models/User.php](/backend/app/Models/User.php) | PHP | 73 | 2 | 14 | 89 |
| [backend/app/Providers/AppServiceProvider.php](/backend/app/Providers/AppServiceProvider.php) | PHP | 12 | 8 | 5 | 25 |
| [backend/bootstrap/app.php](/backend/bootstrap/app.php) | PHP | 19 | 1 | 3 | 23 |
| [backend/bootstrap/providers.php](/backend/bootstrap/providers.php) | PHP | 5 | 0 | 3 | 8 |
| [backend/composer.json](/backend/composer.json) | JSON | 89 | 0 | 1 | 90 |
| [backend/composer.lock](/backend/composer.lock) | JSON | 9,583 | 0 | 1 | 9,584 |
| [backend/config/app.php](/backend/config/app.php) | PHP | 22 | 82 | 23 | 127 |
| [backend/config/auth.php](/backend/config/auth.php) | PHP | 29 | 74 | 15 | 118 |
| [backend/config/cache.php](/backend/config/cache.php) | PHP | 64 | 35 | 19 | 118 |
| [backend/config/cors.php](/backend/config/cors.php) | PHP | 13 | 12 | 12 | 37 |
| [backend/config/database.php](/backend/config/database.php) | PHP | 119 | 43 | 23 | 185 |
| [backend/config/filesystems.php](/backend/config/filesystems.php) | PHP | 36 | 32 | 13 | 81 |
| [backend/config/logging.php](/backend/config/logging.php) | PHP | 79 | 33 | 21 | 133 |
| [backend/config/mail.php](/backend/config/mail.php) | PHP | 57 | 43 | 19 | 119 |
| [backend/config/queue.php](/backend/config/queue.php) | PHP | 65 | 45 | 20 | 130 |
| [backend/config/sanctum.php](/backend/config/sanctum.php) | PHP | 20 | 54 | 14 | 88 |
| [backend/config/services.php](/backend/config/services.php) | PHP | 20 | 11 | 8 | 39 |
| [backend/config/session.php](/backend/config/session.php) | PHP | 23 | 160 | 35 | 218 |
| [backend/database/factories/BankFactory copy 2.php](/backend/database/factories/BankFactory%20copy%202.php) | PHP | 24 | 0 | 6 | 30 |
| [backend/database/factories/BankFactory copy.php](/backend/database/factories/BankFactory%20copy.php) | PHP | 24 | 0 | 6 | 30 |
| [backend/database/factories/BankFactory.php](/backend/database/factories/BankFactory.php) | PHP | 24 | 0 | 6 | 30 |
| [backend/database/factories/CustomerFactory.php](/backend/database/factories/CustomerFactory.php) | PHP | 28 | 1 | 7 | 36 |
| [backend/database/factories/InvoiceFactory.php](/backend/database/factories/InvoiceFactory.php) | PHP | 25 | 3 | 5 | 33 |
| [backend/database/factories/InvoiceItemFactory copy.php](/backend/database/factories/InvoiceItemFactory%20copy.php) | PHP | 11 | 9 | 4 | 24 |
| [backend/database/factories/InvoiceItemFactory.php](/backend/database/factories/InvoiceItemFactory.php) | PHP | 11 | 9 | 4 | 24 |
| [backend/database/factories/LeadActivityFactory.php](/backend/database/factories/LeadActivityFactory.php) | PHP | 16 | 8 | 4 | 28 |
| [backend/database/factories/LeadFactory.php](/backend/database/factories/LeadFactory.php) | PHP | 20 | 0 | 5 | 25 |
| [backend/database/factories/LeadNoteCommentFactory.php](/backend/database/factories/LeadNoteCommentFactory.php) | PHP | 12 | 9 | 4 | 25 |
| [backend/database/factories/LeadNoteFactory.php](/backend/database/factories/LeadNoteFactory.php) | PHP | 12 | 9 | 4 | 25 |
| [backend/database/factories/PipelineFactory.php](/backend/database/factories/PipelineFactory.php) | PHP | 15 | 8 | 4 | 27 |
| [backend/database/factories/PipelineStageFactory.php](/backend/database/factories/PipelineStageFactory.php) | PHP | 16 | 8 | 4 | 28 |
| [backend/database/factories/SettingFactory copy.php](/backend/database/factories/SettingFactory%20copy.php) | PHP | 23 | 0 | 5 | 28 |
| [backend/database/factories/SettingFactory.php](/backend/database/factories/SettingFactory.php) | PHP | 23 | 0 | 5 | 28 |
| [backend/database/factories/TaxFactory copy.php](/backend/database/factories/TaxFactory%20copy.php) | PHP | 22 | 0 | 5 | 27 |
| [backend/database/factories/TaxFactory.php](/backend/database/factories/TaxFactory.php) | PHP | 22 | 0 | 5 | 27 |
| [backend/database/factories/TransactionFactory.php](/backend/database/factories/TransactionFactory.php) | PHP | 28 | 0 | 5 | 33 |
| [backend/database/factories/UserFactory.php](/backend/database/factories/UserFactory.php) | PHP | 37 | 3 | 7 | 47 |
| [backend/database/migrations/0001\_01\_01\_000000\_create\_users\_table.php](/backend/database/migrations/0001_01_01_000000_create_users_table.php) | PHP | 58 | 7 | 17 | 82 |
| [backend/database/migrations/0001\_01\_01\_000001\_create\_cache\_table.php](/backend/database/migrations/0001_01_01_000001_create_cache_table.php) | PHP | 25 | 6 | 5 | 36 |
| [backend/database/migrations/0001\_01\_01\_000002\_create\_jobs\_table.php](/backend/database/migrations/0001_01_01_000002_create_jobs_table.php) | PHP | 46 | 6 | 6 | 58 |
| [backend/database/migrations/2025\_10\_07\_045950\_create\_settings\_table.php](/backend/database/migrations/2025_10_07_045950_create_settings_table.php) | PHP | 23 | 0 | 8 | 31 |
| [backend/database/migrations/2025\_10\_07\_050743\_create\_notifications\_table.php](/backend/database/migrations/2025_10_07_050743_create_notifications_table.php) | PHP | 28 | 0 | 7 | 35 |
| [backend/database/migrations/2025\_10\_07\_052156\_create\_taxes\_table.php](/backend/database/migrations/2025_10_07_052156_create_taxes_table.php) | PHP | 26 | 0 | 6 | 32 |
| [backend/database/migrations/2025\_10\_07\_072930\_create\_banks\_table.php](/backend/database/migrations/2025_10_07_072930_create_banks_table.php) | PHP | 31 | 5 | 8 | 44 |
| [backend/database/migrations/2025\_11\_30\_070221\_create\_customers\_table.php](/backend/database/migrations/2025_11_30_070221_create_customers_table.php) | PHP | 40 | 5 | 10 | 55 |
| [backend/database/migrations/2025\_12\_05\_063158\_create\_invoices\_table.php](/backend/database/migrations/2025_12_05_063158_create_invoices_table.php) | PHP | 54 | 7 | 12 | 73 |
| [backend/database/migrations/2025\_12\_05\_063744\_create\_invoice\_items\_table.php](/backend/database/migrations/2025_12_05_063744_create_invoice_items_table.php) | PHP | 26 | 3 | 8 | 37 |
| [backend/database/migrations/2026\_01\_29\_070235\_create\_invoice\_taxes\_table.php](/backend/database/migrations/2026_01_29_070235_create_invoice_taxes_table.php) | PHP | 28 | 6 | 11 | 45 |
| [backend/database/migrations/2026\_02\_11\_082657\_create\_transactions\_table.php](/backend/database/migrations/2026_02_11_082657_create_transactions_table.php) | PHP | 38 | 7 | 13 | 58 |
| [backend/database/migrations/2026\_05\_04\_053545\_create\_pipelines\_table.php](/backend/database/migrations/2026_05_04_053545_create_pipelines_table.php) | PHP | 23 | 6 | 7 | 36 |
| [backend/database/migrations/2026\_05\_04\_053547\_create\_pipeline\_stages\_table.php](/backend/database/migrations/2026_05_04_053547_create_pipeline_stages_table.php) | PHP | 23 | 6 | 7 | 36 |
| [backend/database/migrations/2026\_05\_04\_136114\_create\_leads\_table.php](/backend/database/migrations/2026_05_04_136114_create_leads_table.php) | PHP | 42 | 13 | 11 | 66 |
| [backend/database/migrations/2026\_05\_04\_153552\_create\_lead\_activities\_table.php](/backend/database/migrations/2026_05_04_153552_create_lead_activities_table.php) | PHP | 26 | 6 | 9 | 41 |
| [backend/database/migrations/2026\_05\_08\_144823\_create\_personal\_access\_tokens\_table.php](/backend/database/migrations/2026_05_08_144823_create_personal_access_tokens_table.php) | PHP | 24 | 6 | 4 | 34 |
| [backend/database/migrations/2026\_05\_12\_055529\_create\_lead\_notes\_table.php](/backend/database/migrations/2026_05_12_055529_create_lead_notes_table.php) | PHP | 27 | 6 | 9 | 42 |
| [backend/database/migrations/2026\_05\_12\_055535\_create\_lead\_note\_comments\_table.php](/backend/database/migrations/2026_05_12_055535_create_lead_note_comments_table.php) | PHP | 26 | 6 | 8 | 40 |
| [backend/database/seeders/DatabaseSeeder.php](/backend/database/seeders/DatabaseSeeder.php) | PHP | 52 | 6 | 12 | 70 |
| [backend/package.json](/backend/package.json) | JSON | 17 | 0 | 1 | 18 |
| [backend/phpunit.xml](/backend/phpunit.xml) | XML | 36 | 0 | 1 | 37 |
| [backend/public/index.php](/backend/public/index.php) | PHP | 10 | 4 | 7 | 21 |
| [backend/resources/css/app.css](/backend/resources/css/app.css) | CSS | 9 | 0 | 3 | 12 |
| [backend/resources/js/app.js](/backend/resources/js/app.js) | JavaScript | 1 | 0 | 1 | 2 |
| [backend/resources/js/bootstrap.js](/backend/resources/js/bootstrap.js) | JavaScript | 3 | 0 | 2 | 5 |
| [backend/resources/views/welcome.blade.php](/backend/resources/views/welcome.blade.php) | PHP | 270 | 0 | 8 | 278 |
| [backend/routes/api.php](/backend/routes/api.php) | PHP | 171 | 85 | 43 | 299 |
| [backend/routes/console.php](/backend/routes/console.php) | PHP | 6 | 0 | 3 | 9 |
| [backend/routes/web.php](/backend/routes/web.php) | PHP | 5 | 0 | 3 | 8 |
| [backend/tests/Feature/ExampleTest.php](/backend/tests/Feature/ExampleTest.php) | PHP | 11 | 4 | 5 | 20 |
| [backend/tests/TestCase.php](/backend/tests/TestCase.php) | PHP | 6 | 1 | 4 | 11 |
| [backend/tests/Unit/ExampleTest.php](/backend/tests/Unit/ExampleTest.php) | PHP | 10 | 3 | 4 | 17 |
| [backend/vendor/brick/math/tools/ecs/composer.json](/backend/vendor/brick/math/tools/ecs/composer.json) | JSON | 10 | 0 | 1 | 11 |
| [backend/vendor/brick/math/tools/ecs/ecs.php](/backend/vendor/brick/math/tools/ecs/ecs.php) | PHP | 24 | 2 | 8 | 34 |
| [backend/vite.config.js](/backend/vite.config.js) | JavaScript | 17 | 0 | 2 | 19 |
| [frontend/README.md](/frontend/README.md) | Markdown | 38 | 0 | 33 | 71 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | 18,919 | 0 | 1 | 18,920 |
| [frontend/package.json](/frontend/package.json) | JSON | 63 | 0 | 1 | 64 |
| [frontend/public/index.html](/frontend/public/index.html) | Django HTML | 40 | 0 | 4 | 44 |
| [frontend/public/manifest.json](/frontend/public/manifest.json) | JSON | 25 | 0 | 1 | 26 |
| [frontend/src/App.css](/frontend/src/App.css) | CSS | 33 | 0 | 6 | 39 |
| [frontend/src/App.js](/frontend/src/App.js) | JavaScript | 104 | 18 | 31 | 153 |
| [frontend/src/App.test.js](/frontend/src/App.test.js) | JavaScript | 7 | 0 | 2 | 9 |
| [frontend/src/assets/SVG/Delete.jsx](/frontend/src/assets/SVG/Delete.jsx) | JavaScript JSX | 14 | 0 | 1 | 15 |
| [frontend/src/assets/SVG/DragIcon.jsx](/frontend/src/assets/SVG/DragIcon.jsx) | JavaScript JSX | 18 | 0 | 1 | 19 |
| [frontend/src/assets/SVG/Edit.jsx](/frontend/src/assets/SVG/Edit.jsx) | JavaScript JSX | 14 | 0 | 1 | 15 |
| [frontend/src/assets/SVG/Eye.jsx](/frontend/src/assets/SVG/Eye.jsx) | JavaScript JSX | 14 | 0 | 1 | 15 |
| [frontend/src/assets/SVG/EyeSlash.jsx](/frontend/src/assets/SVG/EyeSlash.jsx) | JavaScript JSX | 15 | 0 | 1 | 16 |
| [frontend/src/assets/SVG/Loading.jsx](/frontend/src/assets/SVG/Loading.jsx) | JavaScript JSX | 20 | 0 | 1 | 21 |
| [frontend/src/common/NotificationToast.jsx](/frontend/src/common/NotificationToast.jsx) | JavaScript JSX | 22 | 2 | 3 | 27 |
| [frontend/src/common/UI/CardUI.jsx](/frontend/src/common/UI/CardUI.jsx) | JavaScript JSX | 5 | 0 | 1 | 6 |
| [frontend/src/components/elements/Button.jsx](/frontend/src/components/elements/Button.jsx) | JavaScript JSX | 91 | 4 | 7 | 102 |
| [frontend/src/components/elements/Input.jsx](/frontend/src/components/elements/Input.jsx) | JavaScript JSX | 49 | 0 | 7 | 56 |
| [frontend/src/components/elements/Select.jsx](/frontend/src/components/elements/Select.jsx) | JavaScript JSX | 41 | 0 | 5 | 46 |
| [frontend/src/components/elements/SelectSearch.jsx](/frontend/src/components/elements/SelectSearch.jsx) | JavaScript JSX | 197 | 22 | 33 | 252 |
| [frontend/src/components/elements/SelectSearchJson.jsx](/frontend/src/components/elements/SelectSearchJson.jsx) | JavaScript JSX | 102 | 14 | 17 | 133 |
| [frontend/src/components/elements/Switch.jsx](/frontend/src/components/elements/Switch.jsx) | JavaScript JSX | 72 | 0 | 6 | 78 |
| [frontend/src/components/elements/Textarea.jsx](/frontend/src/components/elements/Textarea.jsx) | JavaScript JSX | 65 | 0 | 7 | 72 |
| [frontend/src/components/elements/index.jsx](/frontend/src/components/elements/index.jsx) | JavaScript JSX | 10 | 0 | 2 | 12 |
| [frontend/src/components/layout/AdminLayout.jsx](/frontend/src/components/layout/AdminLayout.jsx) | JavaScript JSX | 20 | 0 | 3 | 23 |
| [frontend/src/components/layout/Header.jsx](/frontend/src/components/layout/Header.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/layout/Sidebar.jsx](/frontend/src/components/layout/Sidebar.jsx) | JavaScript JSX | 225 | 57 | 43 | 325 |
| [frontend/src/components/layout/Topbar.jsx](/frontend/src/components/layout/Topbar.jsx) | JavaScript JSX | 46 | 7 | 17 | 70 |
| [frontend/src/components/notifications/Notification.jsx](/frontend/src/components/notifications/Notification.jsx) | JavaScript JSX | 16 | 1 | 3 | 20 |
| [frontend/src/components/tables/AddButton.jsx](/frontend/src/components/tables/AddButton.jsx) | JavaScript JSX | 12 | 0 | 3 | 15 |
| [frontend/src/components/tables/AddPaymentButton.jsx](/frontend/src/components/tables/AddPaymentButton.jsx) | JavaScript JSX | 14 | 0 | 3 | 17 |
| [frontend/src/components/tables/BadgeButton.jsx](/frontend/src/components/tables/BadgeButton.jsx) | JavaScript JSX | 60 | 9 | 11 | 80 |
| [frontend/src/components/tables/BulkAction.jsx](/frontend/src/components/tables/BulkAction.jsx) | JavaScript JSX | 49 | 12 | 5 | 66 |
| [frontend/src/components/tables/CallButton.jsx](/frontend/src/components/tables/CallButton.jsx) | JavaScript JSX | 14 | 0 | 1 | 15 |
| [frontend/src/components/tables/CloseButton.jsx](/frontend/src/components/tables/CloseButton.jsx) | JavaScript JSX | 12 | 0 | 2 | 14 |
| [frontend/src/components/tables/ConfirmDialog.jsx](/frontend/src/components/tables/ConfirmDialog.jsx) | JavaScript JSX | 70 | 6 | 10 | 86 |
| [frontend/src/components/tables/CopyButton.jsx](/frontend/src/components/tables/CopyButton.jsx) | JavaScript JSX | 14 | 1 | 3 | 18 |
| [frontend/src/components/tables/CopyLinkButton.jsx](/frontend/src/components/tables/CopyLinkButton.jsx) | JavaScript JSX | 28 | 2 | 5 | 35 |
| [frontend/src/components/tables/CreateGroup.jsx](/frontend/src/components/tables/CreateGroup.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/components/tables/CreateInvoiceButton.jsx](/frontend/src/components/tables/CreateInvoiceButton.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/components/tables/CustomersButton.jsx](/frontend/src/components/tables/CustomersButton.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/components/tables/CustomersList.jsx](/frontend/src/components/tables/CustomersList.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/components/tables/DeleteButton.jsx](/frontend/src/components/tables/DeleteButton.jsx) | JavaScript JSX | 12 | 0 | 2 | 14 |
| [frontend/src/components/tables/DetailsButton.jsx](/frontend/src/components/tables/DetailsButton.jsx) | JavaScript JSX | 14 | 0 | 3 | 17 |
| [frontend/src/components/tables/Dropdown.jsx](/frontend/src/components/tables/Dropdown.jsx) | JavaScript JSX | 34 | 0 | 4 | 38 |
| [frontend/src/components/tables/EditButton.jsx](/frontend/src/components/tables/EditButton.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/components/tables/EmailButton.jsx](/frontend/src/components/tables/EmailButton.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/components/tables/Export.jsx](/frontend/src/components/tables/Export.jsx) | JavaScript JSX | 35 | 0 | 2 | 37 |
| [frontend/src/components/tables/ExportDropdown.jsx](/frontend/src/components/tables/ExportDropdown.jsx) | JavaScript JSX | 74 | 2 | 10 | 86 |
| [frontend/src/components/tables/FilterButton.jsx](/frontend/src/components/tables/FilterButton.jsx) | JavaScript JSX | 11 | 0 | 2 | 13 |
| [frontend/src/components/tables/IconButton.jsx](/frontend/src/components/tables/IconButton.jsx) | JavaScript JSX | 16 | 0 | 1 | 17 |
| [frontend/src/components/tables/ImagePreviewButton.jsx](/frontend/src/components/tables/ImagePreviewButton.jsx) | JavaScript JSX | 60 | 4 | 9 | 73 |
| [frontend/src/components/tables/Pagination.jsx](/frontend/src/components/tables/Pagination.jsx) | JavaScript JSX | 61 | 0 | 4 | 65 |
| [frontend/src/components/tables/SeeInvoiceButton.jsx](/frontend/src/components/tables/SeeInvoiceButton.jsx) | JavaScript JSX | 14 | 1 | 2 | 17 |
| [frontend/src/components/tables/SeePaymentButton.jsx](/frontend/src/components/tables/SeePaymentButton.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/components/tables/SelectOption.jsx](/frontend/src/components/tables/SelectOption.jsx) | JavaScript JSX | 26 | 0 | 3 | 29 |
| [frontend/src/components/tables/WhatsappButton.jsx](/frontend/src/components/tables/WhatsappButton.jsx) | JavaScript JSX | 14 | 0 | 1 | 15 |
| [frontend/src/components/widgets/NotificationWidgets.jsx](/frontend/src/components/widgets/NotificationWidgets.jsx) | JavaScript JSX | 227 | 12 | 67 | 306 |
| [frontend/src/components/widgets/ProfileWidgets.jsx](/frontend/src/components/widgets/ProfileWidgets.jsx) | JavaScript JSX | 115 | 0 | 13 | 128 |
| [frontend/src/components/widgets/ThemeWidget.jsx](/frontend/src/components/widgets/ThemeWidget.jsx) | JavaScript JSX | 114 | 0 | 24 | 138 |
| [frontend/src/components/widgets/TimeWidget.jsx](/frontend/src/components/widgets/TimeWidget.jsx) | JavaScript JSX | 25 | 1 | 7 | 33 |
| [frontend/src/context/SettingsContext.jsx](/frontend/src/context/SettingsContext.jsx) | JavaScript JSX | 81 | 0 | 12 | 93 |
| [frontend/src/data/SidebarMenu copy.json](/frontend/src/data/SidebarMenu%20copy.json) | JSON | 111 | 0 | 3 | 114 |
| [frontend/src/data/SidebarMenu.json](/frontend/src/data/SidebarMenu.json) | JSON | 90 | 0 | 10 | 100 |
| [frontend/src/data/env.js](/frontend/src/data/env.js) | JavaScript | 17 | 7 | 9 | 33 |
| [frontend/src/data/toastCfg.jsx](/frontend/src/data/toastCfg.jsx) | JavaScript JSX | 11 | 0 | 2 | 13 |
| [frontend/src/database/Axios.jsx](/frontend/src/database/Axios.jsx) | JavaScript JSX | 12 | 1 | 2 | 15 |
| [frontend/src/database/Context.jsx](/frontend/src/database/Context.jsx) | JavaScript JSX | 31 | 0 | 6 | 37 |
| [frontend/src/database/Token.jsx](/frontend/src/database/Token.jsx) | JavaScript JSX | 34 | 2 | 10 | 46 |
| [frontend/src/index.css](/frontend/src/index.css) | CSS | 65 | 7 | 14 | 86 |
| [frontend/src/index.js](/frontend/src/index.js) | JavaScript | 30 | 3 | 8 | 41 |
| [frontend/src/logo.svg](/frontend/src/logo.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/src/middleware/ProtectedRoute.jsx](/frontend/src/middleware/ProtectedRoute.jsx) | JavaScript JSX | 8 | 4 | 4 | 16 |
| [frontend/src/pages/auth/ForgotPassword.jsx](/frontend/src/pages/auth/ForgotPassword.jsx) | JavaScript JSX | 54 | 0 | 9 | 63 |
| [frontend/src/pages/auth/Login.jsx](/frontend/src/pages/auth/Login.jsx) | JavaScript JSX | 150 | 4 | 16 | 170 |
| [frontend/src/pages/auth/OTP.jsx](/frontend/src/pages/auth/OTP.jsx) | JavaScript JSX | 7 | 0 | 1 | 8 |
| [frontend/src/pages/auth/ResetPassword.jsx](/frontend/src/pages/auth/ResetPassword.jsx) | JavaScript JSX | 65 | 0 | 12 | 77 |
| [frontend/src/pages/auth/Signup.jsx](/frontend/src/pages/auth/Signup.jsx) | JavaScript JSX | 7 | 0 | 2 | 9 |
| [frontend/src/pages/banks/BanksList.jsx](/frontend/src/pages/banks/BanksList.jsx) | JavaScript JSX | 418 | 30 | 30 | 478 |
| [frontend/src/pages/banks/CreateBank.jsx](/frontend/src/pages/banks/CreateBank.jsx) | JavaScript JSX | 146 | 6 | 18 | 170 |
| [frontend/src/pages/banks/UpdateBank.jsx](/frontend/src/pages/banks/UpdateBank.jsx) | JavaScript JSX | 199 | 15 | 22 | 236 |
| [frontend/src/pages/banks/data.js](/frontend/src/pages/banks/data.js) | JavaScript | 9 | 0 | 5 | 14 |
| [frontend/src/pages/customers/CreateCustomer.jsx](/frontend/src/pages/customers/CreateCustomer.jsx) | JavaScript JSX | 188 | 25 | 27 | 240 |
| [frontend/src/pages/customers/CustomersList.jsx](/frontend/src/pages/customers/CustomersList.jsx) | JavaScript JSX | 498 | 42 | 47 | 587 |
| [frontend/src/pages/customers/UpdateCustomer.jsx](/frontend/src/pages/customers/UpdateCustomer.jsx) | JavaScript JSX | 200 | 11 | 24 | 235 |
| [frontend/src/pages/dashboard/Dashboard.jsx](/frontend/src/pages/dashboard/Dashboard.jsx) | JavaScript JSX | 78 | 5 | 7 | 90 |
| [frontend/src/pages/dashboard/DashboardCard.jsx](/frontend/src/pages/dashboard/DashboardCard.jsx) | JavaScript JSX | 35 | 0 | 4 | 39 |
| [frontend/src/pages/dashboard/DashboardChart.jsx](/frontend/src/pages/dashboard/DashboardChart.jsx) | JavaScript JSX | 63 | 0 | 6 | 69 |
| [frontend/src/pages/employees/CreateEmployee copy.jsx](/frontend/src/pages/employees/CreateEmployee%20copy.jsx) | JavaScript JSX | 349 | 31 | 30 | 410 |
| [frontend/src/pages/employees/CreateEmployee.jsx](/frontend/src/pages/employees/CreateEmployee.jsx) | JavaScript JSX | 333 | 39 | 35 | 407 |
| [frontend/src/pages/employees/EmployeeList.jsx](/frontend/src/pages/employees/EmployeeList.jsx) | JavaScript JSX | 595 | 35 | 50 | 680 |
| [frontend/src/pages/employees/InviteEmployee.jsx](/frontend/src/pages/employees/InviteEmployee.jsx) | JavaScript JSX | 148 | 2 | 22 | 172 |
| [frontend/src/pages/employees/UpdateEmployee.jsx](/frontend/src/pages/employees/UpdateEmployee.jsx) | JavaScript JSX | 215 | 11 | 27 | 253 |
| [frontend/src/pages/forms/Form1.jsx](/frontend/src/pages/forms/Form1.jsx) | JavaScript JSX | 447 | 37 | 41 | 525 |
| [frontend/src/pages/invoices/CreateInvoice.jsx](/frontend/src/pages/invoices/CreateInvoice.jsx) | JavaScript JSX | 644 | 41 | 98 | 783 |
| [frontend/src/pages/invoices/InvoicesList.jsx](/frontend/src/pages/invoices/InvoicesList.jsx) | JavaScript JSX | 421 | 28 | 43 | 492 |
| [frontend/src/pages/invoices/UpdateInvoice.jsx](/frontend/src/pages/invoices/UpdateInvoice.jsx) | JavaScript JSX | 7 | 0 | 2 | 9 |
| [frontend/src/pages/invoices/ViewInvoice.jsx](/frontend/src/pages/invoices/ViewInvoice.jsx) | JavaScript JSX | 299 | 29 | 39 | 367 |
| [frontend/src/pages/leads/CreateLead.jsx](/frontend/src/pages/leads/CreateLead.jsx) | JavaScript JSX | 168 | 10 | 28 | 206 |
| [frontend/src/pages/leads/LeadDetails.jsx](/frontend/src/pages/leads/LeadDetails.jsx) | JavaScript JSX | 792 | 15 | 176 | 983 |
| [frontend/src/pages/leads/LeadList.jsx](/frontend/src/pages/leads/LeadList.jsx) | JavaScript JSX | 1,164 | 21 | 242 | 1,427 |
| [frontend/src/pages/leads/PipelineCreate.jsx](/frontend/src/pages/leads/PipelineCreate.jsx) | JavaScript JSX | 96 | 8 | 21 | 125 |
| [frontend/src/pages/leads/PipelineList.jsx](/frontend/src/pages/leads/PipelineList.jsx) | JavaScript JSX | 216 | 12 | 29 | 257 |
| [frontend/src/pages/leads/UpdateLead.jsx](/frontend/src/pages/leads/UpdateLead.jsx) | JavaScript JSX | 223 | 22 | 29 | 274 |
| [frontend/src/pages/notifications/Notifications.jsx](/frontend/src/pages/notifications/Notifications.jsx) | JavaScript JSX | 103 | 2 | 10 | 115 |
| [frontend/src/pages/others/Maintance.jsx](/frontend/src/pages/others/Maintance.jsx) | JavaScript JSX | 95 | 12 | 31 | 138 |
| [frontend/src/pages/others/NotFound.jsx](/frontend/src/pages/others/NotFound.jsx) | JavaScript JSX | 30 | 0 | 3 | 33 |
| [frontend/src/pages/others/Profile.jsx](/frontend/src/pages/others/Profile.jsx) | JavaScript JSX | 242 | 9 | 77 | 328 |
| [frontend/src/pages/others/Setting.jsx](/frontend/src/pages/others/Setting.jsx) | JavaScript JSX | 389 | 34 | 85 | 508 |
| [frontend/src/pages/taxes/CreateTax.jsx](/frontend/src/pages/taxes/CreateTax.jsx) | JavaScript JSX | 123 | 1 | 13 | 137 |
| [frontend/src/pages/taxes/TaxesList.jsx](/frontend/src/pages/taxes/TaxesList.jsx) | JavaScript JSX | 429 | 42 | 31 | 502 |
| [frontend/src/pages/taxes/UpdateTax.jsx](/frontend/src/pages/taxes/UpdateTax.jsx) | JavaScript JSX | 173 | 7 | 20 | 200 |
| [frontend/src/pages/transactions/CreateTransaction.jsx](/frontend/src/pages/transactions/CreateTransaction.jsx) | JavaScript JSX | 194 | 17 | 31 | 242 |
| [frontend/src/pages/transactions/TransactionsList.jsx](/frontend/src/pages/transactions/TransactionsList.jsx) | JavaScript JSX | 320 | 23 | 35 | 378 |
| [frontend/src/pages/transactions/UpdateTransaction.jsx](/frontend/src/pages/transactions/UpdateTransaction.jsx) | JavaScript JSX | 218 | 9 | 35 | 262 |
| [frontend/src/popups/Delete/DeletePopUp.jsx](/frontend/src/popups/Delete/DeletePopUp.jsx) | JavaScript JSX | 72 | 2 | 7 | 81 |
| [frontend/src/popups/Edit/EditPopUp.jsx](/frontend/src/popups/Edit/EditPopUp.jsx) | JavaScript JSX | 91 | 0 | 7 | 98 |
| [frontend/src/popups/GlobalSearchPopup.jsx](/frontend/src/popups/GlobalSearchPopup.jsx) | JavaScript JSX | 316 | 41 | 104 | 461 |
| [frontend/src/reportWebVitals.js](/frontend/src/reportWebVitals.js) | JavaScript | 12 | 0 | 2 | 14 |
| [frontend/src/setupTests.js](/frontend/src/setupTests.js) | JavaScript | 1 | 4 | 1 | 6 |
| [frontend/src/utils/BanManager.js](/frontend/src/utils/BanManager.js) | JavaScript | 7 | 0 | 2 | 9 |
| [frontend/src/utils/Permission.jsx](/frontend/src/utils/Permission.jsx) | JavaScript JSX | 9 | 5 | 5 | 19 |
| [frontend/src/utils/currencyFormatter.js](/frontend/src/utils/currencyFormatter.js) | JavaScript | 17 | 1 | 2 | 20 |
| [frontend/src/utils/errors.js](/frontend/src/utils/errors.js) | JavaScript | 14 | 0 | 3 | 17 |
| [frontend/src/utils/hasPermission.jsx](/frontend/src/utils/hasPermission.jsx) | JavaScript JSX | 23 | 7 | 15 | 45 |
| [frontend/src/utils/money.js](/frontend/src/utils/money.js) | JavaScript | 13 | 1 | 9 | 23 |
| [frontend/src/utils/numberFormatter.js](/frontend/src/utils/numberFormatter.js) | JavaScript | 7 | 0 | 2 | 9 |
| [frontend/tailwind.config.js](/frontend/tailwind.config.js) | JavaScript | 95 | 1 | 10 | 106 |

[Summary](results.md) / Details / [Diff Summary](diff.md) / [Diff Details](diff-details.md)