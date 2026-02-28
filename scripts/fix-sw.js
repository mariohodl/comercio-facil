#!/usr/bin/env node

/**
 * Post-build script to fix the '_ref is not defined' error in the generated sw.js.
 * 
 * @ducanh2912/next-pwa has a bug where it adds async plugins with '_ref' variable 
 * references to several route registrations. This variable doesn't exist in the 
 * Service Worker context, causing a ReferenceError that:
 *   1. Breaks offline support (dinosaur page)
 *   2. Causes social login OAuth redirects to fail (ERR_FAILED)
 * 
 * This script removes all broken plugin references from the generated sw.js.
 */

const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'public', 'sw.js');

if (!fs.existsSync(swPath)) {
    console.log('[fix-sw] sw.js not found, skipping...');
    process.exit(0);
}

let content = fs.readFileSync(swPath, 'utf8');
let fixCount = 0;

// Fix 1: start-url route with broken NetworkFirst plugin
const startUrlPattern = /s\.registerRoute\("\/",new s\.NetworkFirst\(\{cacheName:"start-url",plugins:\[.*?\]\}\),"GET"\)/;
if (startUrlPattern.test(content)) {
    content = content.replace(startUrlPattern, `s.registerRoute("/",new s.NetworkFirst({cacheName:"start-url",plugins:[]}),"GET")`);
    fixCount++;
    console.log('[fix-sw] ✅ Fixed: start-url NetworkFirst _ref plugin');
}

// Fix 2: any handler with plugins referencing _ref
// Removes plugin entries that contain "_ref.apply"
const refPluginPattern = /\{(?:cacheWillUpdate|handlerDidError|cacheKeyWillBeUsed|requestWillFetch|fetchDidFail|fetchDidSucceed|cacheDidUpdate):function\([^)]*\)\{return _ref\.apply\(this,arguments\)\}\}/g;
const matches = content.match(refPluginPattern);
if (matches) {
    content = content.replace(refPluginPattern, '');
    // Clean up any leftover commas from removed plugins: [,{...}] or [{...},]
    content = content.replace(/plugins:\[,/g, 'plugins:[');
    content = content.replace(/,\]/g, ']');
    fixCount += matches.length;
    console.log(`[fix-sw] ✅ Fixed: ${matches.length} additional _ref plugin(s)`);
}

if (fixCount > 0) {
    fs.writeFileSync(swPath, content, 'utf8');
    console.log(`[fix-sw] ✅ sw.js patched successfully (${fixCount} fixes applied)`);
} else {
    console.log('[fix-sw] ℹ️  No broken patterns found in sw.js');
}

// Final verification
const remaining = (content.match(/_ref/g) || []).length;
if (remaining > 0) {
    console.warn(`[fix-sw] ⚠️  WARNING: ${remaining} _ref occurrences still remain - manual review needed`);
} else {
    console.log('[fix-sw] ✅ Verification passed - no _ref references remaining');
}
