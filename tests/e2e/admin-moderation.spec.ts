import { test, expect } from '@playwright/test';
import { supabase } from '../utils/db';

test.describe('Admin Workflows', () => {

    // Setup: Ensure we have an item to moderate
    // In a real scenario, we might seed the DB here.
    // For now, we rely on the guest submission test or create one.
    const testItemTitle = `Admin Test Item ${Date.now()}`;

    test.beforeAll(async () => {
        // Create a pending item directly in DB for moderation test
        await supabase.from('items').insert({
            title: testItemTitle,
            description: 'Item to be moderated',
            city: 'Test City',
            status: 'pending',
            contact_phone: '123456',
            // Assuming a category exists, we need an ID. 
            // We can fetch one first.
        });
    });

    // Login helper or step
    test.beforeEach(async ({ page }) => {
        // Simulate Admin Login
        // NOTE: Since there is no specific /login page implemented in the UI yet (based on codebase exploration),
        // this step assumes standard login flow or that the user has a way to get the session.
        // For this test to pass in the future, the login page must exist at /login
        // or we must bypass auth.

        // page.goto('/login');
        // await page.getByLabel('Email').fill('admin@example.com');
        // await page.getByLabel('Password').fill('password');
        // await page.getByRole('button', { name: 'Login' }).click();
        // await expect(page).toHaveURL('/admin');

        // For now, if we can't login, we can't fully test the protected routes via UI.
        // We will assume the user has a session. 
        // If running locally, you might need to manually set the storage state.
        // test.use({ storageState: 'admin.json' }); 

        // Checking if we are redirected to home (means not logged in)
        await page.goto('/admin');
        if (page.url() === 'http://localhost:3000/') {
            console.log('Redirected to home. Admin is not logged in.');
            // If we are redirected, we can't proceed with the test correctly.
            // We'll mark the test as skipped if we can't login, or fail it.
            // test.skip('Admin not logged in');
        }
    });

    test('Admin Moderation Flow', async ({ page }) => {
        // Navigate to moderation queue
        await page.goto('/admin/moderation');

        // Find the item
        const row = page.locator('tr', { hasText: testItemTitle });
        await expect(row).toBeVisible();

        // Click Approve (Check icon)
        // The button has a child standard SVG or Lucide icon.
        // Based on code: <Button variant="outline" ...><Check .../></Button>
        // We target the button within the row.
        // We can use the class "text-green-600" or similar as distinct selector
        await row.locator('button.text-green-600').click();

        // Verify success toast/message
        await expect(page.getByText('Item approved')).toBeVisible();

        // Check visibility on Home
        await page.goto('/');
        await expect(page.getByText(testItemTitle)).toBeVisible();
    });

    test('Feature Flag Logic', async ({ page }) => {
        // Go to Admin Settings
        await page.goto('/admin/settings');

        // Toggle "Transporter Module" OFF
        const transporterSwitch = page.locator('#feature_transporter');

        // Ensure it is initially ON or check state. 
        // The test says "Turn OFF". 
        // If it is checked, click it.
        if (await transporterSwitch.isChecked()) {
            await transporterSwitch.click();
            await expect(page.getByText('Setting updated')).toBeVisible();
        }

        // Go to /donate and verify "Needs Transportation" is GONE
        await page.goto('/donate');
        await expect(page.getByLabel('Needs Transportation?')).not.toBeVisible();

        // Cleanup: Turn it back ON for other tests?
        // Good practice.
        await page.goto('/admin/settings');
        if (!(await transporterSwitch.isChecked())) {
            await transporterSwitch.click();
        }
    });
});
