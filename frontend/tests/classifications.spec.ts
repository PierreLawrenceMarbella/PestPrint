import { test, expect } from "@playwright/test";
import path from "node:path";

const image = path.resolve("public/images/unknown-damage.jpg");
const currentClasses = [
  "healthy_rice",
  "rice_leaffolder",
  "rice_stem_borer",
  "unknown",
];
const labels = [
  "Healthy Rice",
  "Brown Planthopper Damage",
  "Stem Borer Damage",
  "Rice Leaffolder Damage",
  "Unknown (Other Damage)",
];

test("five category cards accurately describe the current model and link to the guide", async ({
  page,
}) => {
  await page.goto("/analyze");
  const section = page.getByRole("region", { name: "Supported Classes" });
  await expect(section.getByRole("link")).toHaveCount(5);
  for (const name of labels)
    await expect(
      section.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await expect(
    section.getByText("Model supported", { exact: true }),
  ).toHaveCount(4);
  await expect(
    section.getByRole("link", { name: /Brown Planthopper Damage/ }),
  ).toContainText("Guide only");
  await expect(
    page.getByRole("heading", { name: "Tips for Better Results" }),
  ).toBeVisible();
  expect(
    await section
      .locator("img")
      .evaluateAll((images) =>
        images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
      ),
  ).toBe(true);
  await section.getByRole("link", { name: /Unknown \(Other Damage\)/ }).click();
  await expect(page).toHaveURL(/\/pest-guide\/unknown-damage$/);
  await expect(
    page.getByRole("heading", { name: "Unknown (Other Damage)", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to Pest Guide" }).click();
  await expect(page.getByRole("link", { name: "View Details" })).toHaveCount(5);
});

test("actual model Unknown result uses four genuine probabilities and resets cleanly", async ({
  page,
}) => {
  await page.goto("/analyze");
  await page.getByLabel("Choose crop image").setInputFiles(image);
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/api/analyze") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Analyze Image", exact: true })
    .click();
  const data = await (await response).json();
  expect(data.prediction).toBe("unknown");
  expect(data.unknown_method).toBe("trained_class");
  expect(Object.keys(data.probabilities).sort()).toEqual(
    [...currentClasses].sort(),
  );
  await expect(
    page.getByRole("heading", { name: "Unknown (Other Damage)", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(`Confidence Score: ${(data.confidence * 100).toFixed(1)}%`),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(4);
  await expect(
    page.getByRole("progressbar", { name: "Unknown (Other Damage)" }),
  ).toHaveAttribute(
    "aria-valuenow",
    String(Number((data.confidence * 100).toFixed(1))),
  );
  await expect(
    page.getByRole("progressbar", { name: "Brown Planthopper Damage" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: "../.artifacts/unknown-result-real.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Analyze Another Image" }).click();
  await expect(page.getByAltText("Selected rice crop preview")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Your Analysis Results" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Choose Image", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Supported Classes" }),
  ).toBeVisible();
});

// Future five-output model contract, deliberately mocked only in this test.
test("five-class API fixture renders Brown Planthopper without changing current model weights", async ({
  page,
}) => {
  const classes = [...currentClasses, "brown_planthopper"];
  await page.route("**/api/health", (route) =>
    route.fulfill({
      json: {
        available: true,
        classes,
        message: "Five-class development fixture",
      },
    }),
  );
  await page.route("**/api/analyze", (route) =>
    route.fulfill({
      json: {
        prediction: "brown_planthopper",
        confidence: 0.8,
        probabilities: Object.fromEntries(
          classes.map((id) => [id, id === "brown_planthopper" ? 0.8 : 0.05]),
        ),
        model: "Five-class development fixture",
        unknown_method: "trained_class",
      },
    }),
  );
  await page.goto("/analyze");
  await expect(page.getByText("Model supported", { exact: true })).toHaveCount(
    5,
  );
  await page.getByLabel("Choose crop image").setInputFiles(image);
  await page
    .getByRole("button", { name: "Analyze Image", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Brown Planthopper Damage",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(5);
  await page
    .getByRole("link", { name: /Learn More About Brown Planthopper/ })
    .click();
  await expect(page).toHaveURL(/\/pest-guide\/brown-planthopper$/);
});

test("a low-confidence known class is not reassigned to Unknown", async ({
  page,
}) => {
  await page.route("**/api/analyze", (route) =>
    route.fulfill({
      json: {
        prediction: "rice_leaffolder",
        confidence: 0.28,
        probabilities: {
          healthy_rice: 0.24,
          rice_leaffolder: 0.28,
          rice_stem_borer: 0.24,
          unknown: 0.24,
        },
        model: "Low-confidence development fixture",
        unknown_method: "trained_class",
      },
    }),
  );
  await page.goto("/analyze");
  await page.getByLabel("Choose crop image").setInputFiles(image);
  await page
    .getByRole("button", { name: "Analyze Image", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Rice Leaffolder Damage", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Confidence Score: 28.0%")).toBeVisible();
  await expect(page.locator(".results-panel")).toHaveClass(/pest/);
});

test("API probabilities cannot silently add an unsupported fifth model class", async ({
  page,
}) => {
  await page.route("**/api/analyze", (route) =>
    route.fulfill({
      json: {
        prediction: "unknown",
        confidence: 0.8,
        probabilities: {
          healthy_rice: 0.05,
          rice_leaffolder: 0.05,
          rice_stem_borer: 0.05,
          brown_planthopper: 0.05,
          unknown: 0.8,
        },
        model: "Invalid development fixture",
        unknown_method: "trained_class",
      },
    }),
  );
  await page.goto("/analyze");
  await page.getByLabel("Choose crop image").setInputFiles(image);
  await page
    .getByRole("button", { name: "Analyze Image", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("unsupported response");
  await expect(
    page.getByRole("heading", { name: "Your Analysis Results" }),
  ).toHaveCount(0);
});

test("updated upload and Unknown screens fit phone, tablet and desktop", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/analyze", (route) =>
    route.fulfill({
      json: {
        prediction: "unknown",
        confidence: 0.91,
        probabilities: {
          healthy_rice: 0.03,
          rice_leaffolder: 0.03,
          rice_stem_borer: 0.03,
          unknown: 0.91,
        },
        model: "Responsive development fixture",
        unknown_method: "trained_class",
      },
    }),
  );
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/analyze",
      "/pest-guide",
      "/pest-guide/unknown-damage",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto("/analyze");
    await page.screenshot({
      path: `../.artifacts/unknown-upload-${width}.png`,
      fullPage: true,
    });
    await page.getByLabel("Choose crop image").setInputFiles(image);
    await page
      .getByRole("button", { name: "Analyze Image", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Your Analysis Results" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `../.artifacts/unknown-result-fixture-${width}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
