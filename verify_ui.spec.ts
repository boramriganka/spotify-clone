import { test, expect } from '@playwright/test';

const resolutions = [
  { width: 360, height: 800, name: '360x800' },
  { width: 390, height: 844, name: '390x844' },
  { width: 430, height: 932, name: '430x932' },
  { width: 768, height: 1024, name: '768x1024' },
  { width: 1024, height: 768, name: '1024x768' },
  { width: 1440, height: 900, name: '1440x900' },
];

for (const res of resolutions) {
  test(`Capture screenshots for ${res.name}`, async ({ page }) => {
    await page.setViewportSize({ width: res.width, height: res.height });

    // Home Page
    await page.goto('http://localhost:3008/');
    await page.waitForTimeout(2000); // Wait for data to load
    await page.screenshot({ path: `screenshots/home_${res.name}.png` });

    // Search Page
    await page.click('a[href="/search"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/search_empty_${res.name}.png` });

    await page.fill('input[placeholder="What do you want to listen to?"]', 'Zubeen Garg');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `screenshots/search_results_${res.name}.png` });

    // Click a song to start player
    const playButton = page.locator('.media-card .play-button').first();
    if (await playButton.isVisible()) {
        await playButton.click();
    } else {
        await page.locator('.media-card').first().click();
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `screenshots/player_active_${res.name}.png` });

    // Open Full Player (Mobile only)
    if (res.width < 768) {
        await page.click('.mini-player');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `screenshots/full_player_${res.name}.png` });
    }
  });
}
