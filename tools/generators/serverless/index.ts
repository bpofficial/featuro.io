import {
  formatFiles,
  generateFiles,
  installPackagesTask,
  joinPathFragments,
  Tree,
} from '@nrwl/devkit';
import { Schema } from './schema';
import { addJest } from './jest-config';
import { addWorkspaceConfig } from './workspace-config';

function cap(val) {
  return val[0].toUpperCase() + val.substring(1);
}

export default async (host: Tree, schema: Schema) => {
  const stackRoot = `stacks/${schema.name}`;

  generateFiles(
    host, // the virtual file system
    joinPathFragments(__dirname, './files'), // path to the file templates
    stackRoot, // destination path of the files
    { ...schema, tmpl: '', cap } // config object to replace variable in file templates
  );

  addWorkspaceConfig(host, schema.name, stackRoot);

  await addJest(host, schema.name);

  await formatFiles(host);

  return () => {
    installPackagesTask(host);
  };
};
