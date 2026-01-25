from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to login...")
        page.goto("http://localhost:3000/login")

        print("Logging in...")
        page.get_by_placeholder("Email").fill("client@company.com")
        page.get_by_placeholder("Mot de passe").fill("admin123")
        page.get_by_role("button", name="Se connecter").click()

        print("Waiting for dashboard...")
        try:
             page.wait_for_url("**/dashboard", timeout=10000)
        except:
             print("Dashboard navigation timeout.")
             browser.close()
             return

        page.wait_for_selector("text=Mes Sessions de Formation", timeout=10000)

        links = page.get_by_role("link", name="Détails").all()
        print(f"Found {len(links)} sessions.")

        for i in range(len(links)):
            print(f"Checking session {i+1}...")
            # Re-query links as page might have refreshed or context lost if we navigated back
            # But here we are on dashboard.
            page.get_by_role("link", name="Détails").nth(i).click()

            print("Waiting for session details...")
            page.wait_for_selector("text=Lieu et Logistique", timeout=10000)

            # Check for modifier button
            modifier_btn = page.get_by_role("button", name="Modifier")
            if modifier_btn.is_visible():
                print("Modifier button found! Clicking...")
                modifier_btn.click()

                print("Waiting for Dialog...")
                dialog = page.get_by_role("dialog")
                expect(dialog).to_be_visible()
                expect(page.get_by_text("Modifier la logistique")).to_be_visible()

                print("Taking screenshot...")
                page.screenshot(path="/home/jules/verification/verification.png")
                print("Success!")
                browser.close()
                return
            else:
                print("Session is locked. Going back.")
                page.go_back()
                page.wait_for_url("**/dashboard")
                page.wait_for_selector("text=Mes Sessions de Formation")

        print("No open sessions found.")
        browser.close()

if __name__ == "__main__":
    run()
