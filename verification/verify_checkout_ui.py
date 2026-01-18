from playwright.sync_api import Page, expect, sync_playwright
import time
import re

def test_checkout_flow(page: Page):
    print("Navigating to Formation page...")
    # Use localhost:3000
    try:
        page.goto("http://localhost:3000/formation/6f37f060-d8c8-45a6-a422-b242d3f2521c", timeout=60000)
    except Exception as e:
        print(f"Navigation failed: {e}")
        return

    # Wait for hydration
    page.wait_for_timeout(3000)

    print("Selecting Zone...")
    triggers = page.get_by_role("combobox").all()
    if len(triggers) == 0:
        print("No combobox found!")
        return

    triggers[0].click()
    page.get_by_role("option", name="Bruxelles").click()

    page.wait_for_timeout(2000)

    print("Selecting Trainer...")
    triggers = page.get_by_role("combobox").all()
    if len(triggers) < 2:
        print("Trainer select not found")
        page.screenshot(path="verification/error_trainer.png")
        return

    triggers[1].click()
    page.get_by_role("option", name="Jean Dupont").click()

    page.wait_for_timeout(2000)

    print("Selecting Date...")
    days = page.locator(".rdp-day_button:not([disabled])").all()
    if len(days) == 0:
        print("No available days!")
        page.screenshot(path="verification/error_calendar.png")
        return

    days[0].click()

    page.wait_for_timeout(1000)

    print("Clicking Reserve...")
    page.get_by_role("button", name="Réserver").click()

    # Expect navigation to checkout
    print("Waiting for checkout page...")
    expect(page).to_have_url(re.compile(r"/checkout"), timeout=10000)

    page.wait_for_timeout(2000)
    page.screenshot(path="verification/checkout_page.png")

    print("Testing VIES...")
    page.fill("#vatNumber", "BE0477472701")
    page.click("button:has-text('Vérifier')")

    page.wait_for_timeout(3000)

    page.screenshot(path="verification/checkout_filled.png")

    val = page.input_value("#companyName")
    print(f"Company Name: {val}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_checkout_flow(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_final.png")
        finally:
            browser.close()
