import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # 1. MOBILE VERIFICATION
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        )
        page = await context.new_page()
        await page.goto('http://localhost:3008', wait_until='networkidle')
        await page.wait_for_selector('.media-card', timeout=60000)

        # Take home screenshot
        await page.screenshot(path='/home/jules/verification/screenshots/final_mobile_home.png')

        # Test Search (Mobile - using bottom nav)
        await page.click('.bottom-nav >> text=Search')
        await page.wait_for_selector('.search-screen', timeout=10000)
        await page.screenshot(path='/home/jules/verification/screenshots/final_mobile_search.png')

        # Test Account Drawer
        await page.goto('http://localhost:3008')
        await page.wait_for_selector('.avatar-btn')
        await page.click('.avatar-btn')
        await page.wait_for_selector('.account-drawer', timeout=10000)
        await asyncio.sleep(1.0) # Wait for transition
        await page.screenshot(path='/home/jules/verification/screenshots/final_mobile_drawer.png')
        await page.click('.close-btn') # Close it using the button
        await page.wait_for_selector('.account-drawer', state='hidden')

        # Play a track and open Full Player
        await page.click('.media-card:first-child', force=True)
        await asyncio.sleep(2.0)
        await page.wait_for_selector('.mini-player', timeout=10000)
        await page.screenshot(path='/home/jules/verification/screenshots/final_mobile_playing_mini.png')
        await page.click('.mini-player')
        await page.wait_for_selector('.full-player', timeout=10000)
        await page.screenshot(path='/home/jules/verification/screenshots/final_mobile_full_player.png')

        # 2. DESKTOP VERIFICATION
        context_desktop = await browser.new_context(viewport={'width': 1440, 'height': 900})
        page_desktop = await context_desktop.new_page()
        await page_desktop.goto('http://localhost:3008', wait_until='networkidle')
        await page_desktop.wait_for_selector('.media-card', timeout=60000)

        # Play track
        await page_desktop.click('.media-card:first-child')
        await page_desktop.wait_for_selector('.desktop-player', timeout=10000)

        # Toggle Panel (DesktopPlayer usually has it on the right)
        # Using a broad selector for the button in extra-controls
        await page_desktop.click('.extra-controls button:last-child')
        await asyncio.sleep(1)
        await page_desktop.screenshot(path='/home/jules/verification/screenshots/final_desktop_layout.png')

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
