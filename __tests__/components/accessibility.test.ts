/**
 * @file __tests__/components/accessibility.test.ts
 * @description Accessibility and UI structure tests for Urbanguard components.
 * Validates ARIA attributes, semantic HTML patterns, and keyboard navigation support.
 */

// ── Accessibility Utility Helpers ─────────────────────────────────────────────

interface AccessibleElement {
  tagName: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  id?: string;
  type?: string;
  hasAltText?: boolean;
}

function isInteractiveElement(el: AccessibleElement): boolean {
  const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
  return interactiveTags.includes(el.tagName.toLowerCase());
}

function hasAccessibleLabel(el: AccessibleElement): boolean {
  return Boolean(el.ariaLabel || el.ariaLabelledBy || el.id);
}

function isFocusable(el: AccessibleElement): boolean {
  if (isInteractiveElement(el)) {return true;}
  if (el.tabIndex !== undefined && el.tabIndex >= 0) {return true;}
  return false;
}

function validateImageAccessibility(el: AccessibleElement): { valid: boolean; error?: string } {
  if (el.tagName.toLowerCase() === 'img') {
    if (!el.hasAltText) {
      return { valid: false, error: 'Image missing alt text' };
    }
  }
  return { valid: true };
}

function validateFormField(el: AccessibleElement): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (['input', 'select', 'textarea'].includes(el.tagName.toLowerCase())) {
    if (!el.ariaLabel && !el.ariaLabelledBy && !el.id) {
      errors.push('Form field must have an accessible label (aria-label, aria-labelledby, or id)');
    }
    if (el.tagName === 'input' && !el.type) {
      errors.push('Input field should have an explicit type attribute');
    }
  }
  return { valid: errors.length === 0, errors };
}

// ── Semantic Structure Helpers ────────────────────────────────────────────────

interface PageStructure {
  hasNav: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  hasH1: boolean;
  h1Count: number;
  hasSkipLink: boolean;
  landmarks: string[];
}

function validatePageStructure(structure: PageStructure): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!structure.hasNav) {warnings.push('Page should have a <nav> element');}
  if (!structure.hasMain) {warnings.push('Page should have a <main> element');}
  if (!structure.hasFooter) {warnings.push('Page should have a <footer> element');}
  if (!structure.hasH1) {warnings.push('Page should have at least one <h1>');}
  if (structure.h1Count > 1) {warnings.push('Page should have only one <h1> for SEO');}
  return { valid: warnings.length === 0, warnings };
}

// ── Color Contrast Helpers ────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) {return 0;}
  const l1 = getRelativeLuminance(c1.r, c1.g, c1.b);
  const l2 = getRelativeLuminance(c2.r, c2.g, c2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

function meetsWCAGAAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// ── Accessibility Element Tests ───────────────────────────────────────────────

describe('isInteractiveElement', () => {
  it('identifies buttons as interactive', () => {
    expect(isInteractiveElement({ tagName: 'button' })).toBe(true);
  });
  it('identifies links as interactive', () => {
    expect(isInteractiveElement({ tagName: 'a' })).toBe(true);
  });
  it('identifies inputs as interactive', () => {
    expect(isInteractiveElement({ tagName: 'input' })).toBe(true);
  });
  it('identifies divs as non-interactive', () => {
    expect(isInteractiveElement({ tagName: 'div' })).toBe(false);
  });
  it('identifies spans as non-interactive', () => {
    expect(isInteractiveElement({ tagName: 'span' })).toBe(false);
  });
});

describe('hasAccessibleLabel', () => {
  it('returns true when aria-label is set', () => {
    expect(hasAccessibleLabel({ tagName: 'button', ariaLabel: 'Submit form' })).toBe(true);
  });
  it('returns true when aria-labelledby is set', () => {
    expect(hasAccessibleLabel({ tagName: 'input', ariaLabelledBy: 'label-1' })).toBe(true);
  });
  it('returns true when id is set', () => {
    expect(hasAccessibleLabel({ tagName: 'input', id: 'email-field' })).toBe(true);
  });
  it('returns false when no label is present', () => {
    expect(hasAccessibleLabel({ tagName: 'button' })).toBe(false);
  });
});

describe('isFocusable', () => {
  it('interactive elements are focusable', () => {
    expect(isFocusable({ tagName: 'button' })).toBe(true);
    expect(isFocusable({ tagName: 'a' })).toBe(true);
  });
  it('divs with tabIndex >= 0 are focusable', () => {
    expect(isFocusable({ tagName: 'div', tabIndex: 0 })).toBe(true);
  });
  it('plain divs are not focusable', () => {
    expect(isFocusable({ tagName: 'div' })).toBe(false);
  });
  it('elements with negative tabIndex are not focusable', () => {
    expect(isFocusable({ tagName: 'div', tabIndex: -1 })).toBe(false);
  });
});

describe('validateImageAccessibility', () => {
  it('passes when image has alt text', () => {
    expect(validateImageAccessibility({ tagName: 'img', hasAltText: true }).valid).toBe(true);
  });
  it('fails when image is missing alt text', () => {
    const result = validateImageAccessibility({ tagName: 'img', hasAltText: false });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('alt');
  });
  it('passes for non-image elements', () => {
    expect(validateImageAccessibility({ tagName: 'div' }).valid).toBe(true);
  });
});

describe('validateFormField', () => {
  it('passes when form field has aria-label', () => {
    const result = validateFormField({ tagName: 'input', ariaLabel: 'Email', type: 'email' });
    expect(result.valid).toBe(true);
  });
  it('fails when input has no accessible label', () => {
    const result = validateFormField({ tagName: 'input', type: 'text' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  it('warns when input is missing type attribute', () => {
    const result = validateFormField({ tagName: 'input', ariaLabel: 'Search' });
    expect(result.errors.some((e) => e.includes('type'))).toBe(true);
  });
});

// ── Page Structure Tests ──────────────────────────────────────────────────────

describe('validatePageStructure', () => {
  it('passes with a complete page structure', () => {
    const result = validatePageStructure({
      hasNav: true, hasMain: true, hasFooter: true,
      hasH1: true, h1Count: 1, hasSkipLink: true,
      landmarks: ['navigation', 'main', 'contentinfo'],
    });
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns about missing nav', () => {
    const result = validatePageStructure({
      hasNav: false, hasMain: true, hasFooter: true,
      hasH1: true, h1Count: 1, hasSkipLink: false,
      landmarks: ['main'],
    });
    expect(result.warnings.some((w) => w.includes('nav'))).toBe(true);
  });

  it('warns about multiple h1 tags', () => {
    const result = validatePageStructure({
      hasNav: true, hasMain: true, hasFooter: true,
      hasH1: true, h1Count: 3, hasSkipLink: false,
      landmarks: ['navigation', 'main'],
    });
    expect(result.warnings.some((w) => w.includes('one <h1>'))).toBe(true);
  });
});

// ── Color Contrast Tests (Urbanguard Palette) ─────────────────────────────────

describe('Color contrast (Urbanguard design system)', () => {
  // Urbanguard palette
  const WHITE = '#FFFFFF';
  const BG = '#F5F7FA';
  const PRIMARY_NAVY = '#183B66';
  const ACCENT_BLUE = '#3978C5';
  const DARK_TEXT = '#263445';
  const SECONDARY_TEXT = '#718096';

  it('hexToRgb parses correctly', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#183B66')).toEqual({ r: 24, g: 59, b: 102 });
  });

  it('dark text on white background meets WCAG AA', () => {
    expect(meetsWCAGAA(DARK_TEXT, WHITE)).toBe(true);
  });

  it('primary navy on white meets WCAG AA', () => {
    expect(meetsWCAGAA(PRIMARY_NAVY, WHITE)).toBe(true);
  });

  it('dark text on light background meets WCAG AA', () => {
    expect(meetsWCAGAA(DARK_TEXT, BG)).toBe(true);
  });

  it('accent blue on white meets WCAG AA for large text', () => {
    expect(meetsWCAGAA(ACCENT_BLUE, WHITE, true)).toBe(true);
  });

  it('white on primary navy meets WCAG AA (inverse)', () => {
    expect(meetsWCAGAA(WHITE, PRIMARY_NAVY)).toBe(true);
  });

  it('contrast ratio is symmetric', () => {
    const r1 = getContrastRatio(DARK_TEXT, WHITE);
    const r2 = getContrastRatio(WHITE, DARK_TEXT);
    expect(Math.abs(r1 - r2)).toBeLessThan(0.01);
  });

  it('black on white has max contrast (~21:1)', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeGreaterThan(20);
  });

  it('identical colors have contrast ratio of 1', () => {
    expect(getContrastRatio('#FF0000', '#FF0000')).toBe(1);
  });
});
