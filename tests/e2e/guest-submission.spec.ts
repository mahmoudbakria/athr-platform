import { test, expect } from '@playwright/test';
import { supabase } from '../utils/db';
import path from 'path';

test('Guest Submission Flow', async ({ page }) => {
    // 1. Visit /donate
    await page.goto('/donate');

    // 2. Fill out the form
    await page.getByLabel('Item Title').fill('Test Item Title');
    await page.getByLabel('Description').fill('This is a test description for the automated test.');

    // Select Category (assuming at least one category exists)
    // We need to click the trigger first, then select an item.
    await page.getByRole('combobox', { name: 'Category' }).click();
    // We pick the first item in the list
    await page.getByRole('option').first().click();

    await page.getByLabel('City').fill('Cairo');
    await page.getByLabel('WhatsApp Number').fill('+201234567890');

    // 3. Upload a dummy image
    // Using a file from the public folder as a dummy image
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Trigger file chooser
    // The input is not directly labeled "Images" in a way that accessible selector might catch easily if it's hidden or complex, 
    // but let's try getByLabel first or point to the input type=file directly.
    // The label "Images" is associated with the div, not directly the input maybe.
    // The code has <FormLabel>Images</FormLabel> followed by <Input type="file" ... />.
    // Usually file inputs are tricky. Better to locate by input[type="file"].
    await page.locator('input[type="file"]').setInputFiles(path.join(process.cwd(), 'public/next.svg'));

    // 4. Submit
    await page.getByRole('button', { name: 'Donate Item' }).click();

    // 5. Verify success message
    await expect(page.getByText('Item donated successfully!')).toBeVisible();

    // 6. DB Check: Ensure the item lands in DB with status 'pending'
    // We wait a bit or query until found
    // We verify via the supabase client

    // Poll for the item
    await expect(async () => {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('title', 'Test Item Title')
            .eq('description', 'This is a test description for the automated test.')
            .single();

        if (error) throw error;
        expect(data).toBeTruthy();
        expect(data.status).toBe('pending');
    }).toPass();
});
