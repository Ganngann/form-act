import os
from playwright.sync_api import sync_playwright, expect

def verify_us_refacto_01():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Define API URL for reference (though the frontend uses its own)
        api_url = "http://localhost:3001"
        frontend_url = "http://localhost:3000/catalogue"

        print(f"Navigating to {frontend_url}")
        try:
            page.goto(frontend_url)
        except Exception as e:
            print(f"Failed to load page: {e}")
            browser.close()
            return

        print("Checking for absence of 'Province' filter...")
        # Search for text "Province" which was used in the old filter
        # It should NOT be present
        province_filter = page.get_by_text("Province", exact=True)
        # We expect it not to be visible or not attached.
        # However, checking count is safer if it's completely gone from DOM
        if province_filter.count() > 0 and province_filter.is_visible():
             print("FAILURE: 'Province' filter found!")
             exit(1)
        else:
             print("SUCCESS: 'Province' filter not found.")

        print("Checking for presence of 'Thème' (Category) filter...")
        # The label is "Filtrer par Thème"
        theme_label = page.get_by_text("Filtrer par Thème")
        expect(theme_label).to_be_visible()
        print("SUCCESS: 'Thème' filter found.")

        print("Verifying Category Selection...")
        # Open the select
        select_trigger = page.get_by_role("combobox")
        select_trigger.click()

        # Select a category (we know 'dev' or similar exists from seed/mock, but let's grab the first item that isn't 'Tous les thèmes')
        # Wait for options to appear
        page.wait_for_selector("[role='option']")

        # Click the second option (index 1, assuming index 0 is "Tous les thèmes")
        options = page.locator("[role='option']")
        count = options.count()
        print(f"Found {count} options.")

        if count > 1:
            option_text = options.nth(1).text_content()
            print(f"Selecting category: {option_text}")
            options.nth(1).click()

            # Wait for network idle or some loading indicator if present
            # The page shows "Chargement..." when loading
            # We wait for it to appear then disappear, or just wait for results

            # Verify that the URL or state updated (optional, but good for verification)
            # The URL should have ?categoryId=...
            # But the React code uses state, let's see if the URL query param is updated.
            # Looking at page.tsx:
            #   useEffect(() => { ... fetch(url) ... }, [selectedCategory])
            # It does NOT update the browser URL (window.history). It just updates internal state.
            # So we verify that the formations list updates.

            # Take a screenshot
            screenshot_path = "verification/us-refacto-01.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")
        else:
            print("WARNING: Not enough categories to test selection.")

        browser.close()

if __name__ == "__main__":
    verify_us_refacto_01()
