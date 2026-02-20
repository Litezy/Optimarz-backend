import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const feature = process.argv[2];
if (!feature) {
  console.error('❌ Please provide a feature name. Example: npm run init user');
  process.exit(1);
}

const featurePath = path.join('src', feature);

if (fs.existsSync(featurePath)) {
  console.log(`⚠️  The feature "${feature}" already exists at ${featurePath}. Skipping creation.`);
  process.exit(0);
}

try {
  execSync(`nest g module ${feature}`, { stdio: 'inherit' });
  execSync(`nest g controller ${feature} --no-spec`, { stdio: 'inherit' });
  execSync(`nest g service ${feature} --no-spec`, { stdio: 'inherit' });
  console.log(`✅ ${feature} feature initialized successfully!`);
} catch (err) {
  console.error(`❌ Error initializing feature "${feature}":`, err.message);
}
