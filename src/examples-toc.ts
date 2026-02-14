import { Colors } from '@qui-cli/colors';
import { Core, Positionals } from '@qui-cli/core';
import * as Plugin from '@qui-cli/plugin';
import { Root } from '@qui-cli/root';
import fs from 'node:fs';
import path from 'node:path';
import { IPackageJson } from 'package-json-type';

const START = '<!-- begin examples-toc -->';
const END = '<!-- end examples-toc -->';
const EOL = '\n\n';

await Plugin.register({
  name: path.basename(import.meta.filename, '.js'),
  options: (): Plugin.Options => {
    Positionals.require({
      examplesPath: {
        description: 'Path to examples directory.'
      }
    });
    Positionals.allowOnlyNamedArgs();
    return {
      man: [
        {
          text:
            `This script expects a path to a directory of example projects ` +
            `optionally contains an existing ${Colors.value('README.md')} ` +
            `file. The ${Colors.value('README.md')} will be updated (or ` +
            `created) with a table of contents built from the package ` +
            `manifests.`
        }
      ]
    };
  },
  init: () => {
    Root.configure({
      root: path.resolve(process.cwd(), Positionals.get('examplesPath') || '.'),
      cwd: true
    });
  },
  run: async () => {
    const toc: string[] = [];
    for (const fileName of fs.readdirSync('.')) {
      if (fs.statSync(fileName).isDirectory()) {
        const pkg = JSON.parse(
          fs.readFileSync(path.join(fileName, 'package.json')).toString()
        ) as IPackageJson;
        toc.push(
          `## [${fileName}](./${encodeURIComponent(fileName)}#readme)${EOL}${pkg.description}`
        );
      }
    }
    const readme = fs.existsSync('README.md')
      ? fs.readFileSync('README.md').toString()
      : `# ${path.basename(path.dirname('.'))}${EOL}${START}${EOL}${END}`;
    fs.writeFileSync(
      'README.md',
      readme.replace(
        new RegExp(`(${START})(.|\\n)*(${END})`),
        `$1${EOL}${toc.join(EOL)}${EOL}$3`
      )
    );
  }
});
await Core.run();
