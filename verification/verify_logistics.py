from playwright.sync_api import Page, expect, sync_playwright

def verify_logistics(page: Page):
    # 1. Go to the test page
    page.goto("http://localhost:3000/test-logistics")

    # 2. Wait for the component to render
    page.wait_for_selector("text=Lieu et Logistique")

    # 3. Take screenshot of the card
    page.screenshot(path="verification/logistics_card.png")
    print("Screenshot card taken")

    # 4. Click Modifier to open dialog
    # Try using role button
    page.get_by_role("button", name="Modifier").click()
    print("Clicked Modifier")

    # 5. Wait for dialog content
    try:
        page.wait_for_selector("text=Modifier la logistique", timeout=5000)
        # 6. Wait for "Complétion du dossier" text (Progress bar)
        page.wait_for_selector("text=Complétion du dossier")

        # 7. Take screenshot of the dialog
        page.screenshot(path="verification/logistics_dialog.png")
        print("Screenshot dialog taken")
    except Exception as e:
        print(f"Error waiting for dialog: {e}")
        page.screenshot(path="verification/error_dialog.png")
        raise e

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_logistics(page)
        except Exception as e:
            print(f"Script failed: {e}")
        finally:
            browser.close()
