import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

function listFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...listFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) result.push(full);
  }
  return result;
}

function source(files: string[]): string[] {
  return files.flatMap((file) => {
    const text = fs
      .readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|\s)\/\/.*$/gm, '$1');
    return text.split(/\r?\n/).map((line, index) => `${file}:${index + 1}:${line}`);
  });
}

function listProjectTextFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  const textExtensions = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.json',
    '.html',
    '.css',
    '.svg',
    '.yml',
    '.yaml',
    '.toml',
  ]);
  const excludedDirectories = new Set(['node_modules', '.git', 'build', 'dist', 'coverage']);
  const result: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...listProjectTextFiles(full));
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) result.push(full);
  }
  return result;
}

function importedSpecifiers(file: string): string[] {
  const text = fs
    .readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');

  const specifiers: string[] = [];

  // Static imports, re-exports, side-effect imports and dynamic imports.
  const pattern =
    /\b(?:import|export)\s+(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of text.matchAll(pattern)) {
    specifiers.push(match[1] ?? match[2]);
  }

  return specifiers;
}

function resolveLocalImport(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.json`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ];
  return (
    candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) ??
    null
  );
}

function layerOf(file: string): string | null {
  const relative = path.relative(ROOT, file).split(path.sep);
  return ['domain', 'application', 'infrastructure', 'editor'].includes(relative[0])
    ? relative[0]
    : null;
}

function assertLocalImportsResolve(files: string[]): void {
  const unresolved: string[] = [];
  for (const file of files) {
    for (const specifier of importedSpecifiers(file)) {
      if (!specifier.startsWith('.')) continue;
      if (!resolveLocalImport(file, specifier)) {
        unresolved.push(`${path.relative(ROOT, file)} -> ${specifier}`);
      }
    }
  }
  if (unresolved.length) {
    throw new Error(`Unresolved relative imports:\n${unresolved.join('\n')}`);
  }
}

function assertImportDirection(
  files: string[],
  sourceLayer: string,
  forbiddenLayers: string[],
): void {
  const violations: string[] = [];
  for (const file of files) {
    for (const specifier of importedSpecifiers(file)) {
      const target = resolveLocalImport(file, specifier);
      if (!target) continue;
      const targetLayer = layerOf(target);
      if (targetLayer && forbiddenLayers.includes(targetLayer)) {
        violations.push(`${path.relative(ROOT, file)} -> ${specifier} (${targetLayer})`);
      }
    }
  }
  if (violations.length) {
    throw new Error(`${sourceLayer} has forbidden local dependencies:\n${violations.join('\n')}`);
  }
}

function assertNoTransitiveLayerDependencies(
  sourceFiles: string[],
  allFiles: string[],
  sourceLayer: string,
  forbiddenLayers: string[],
): void {
  const knownFiles = new Set(allFiles);
  const violations: string[] = [];

  for (const entryFile of sourceFiles) {
    const visited = new Set<string>();
    const walk = (currentFile: string, chain: string[]): void => {
      if (visited.has(currentFile)) return;
      visited.add(currentFile);

      for (const specifier of importedSpecifiers(currentFile)) {
        const target = resolveLocalImport(currentFile, specifier);
        if (!target || !knownFiles.has(target)) continue;
        const targetLayer = layerOf(target);
        const nextChain = [...chain, target];
        if (targetLayer && forbiddenLayers.includes(targetLayer)) {
          violations.push(
            `${path.relative(ROOT, entryFile)} -> ${nextChain.map((item) => path.relative(ROOT, item)).join(' -> ')} (${targetLayer})`,
          );
          continue;
        }
        walk(target, nextChain);
      }
    };
    walk(entryFile, [entryFile]);
  }

  if (violations.length) {
    throw new Error(
      `${sourceLayer} has forbidden transitive local dependencies:\n${[...new Set(violations)].join('\n')}`,
    );
  }
}

function findImportCycles(files: string[]): string[][] {
  const fileSet = new Set(files);
  const edges = new Map<string, string[]>();
  for (const file of files) {
    edges.set(
      file,
      importedSpecifiers(file)
        .map((specifier) => resolveLocalImport(file, specifier))
        .filter((target): target is string => Boolean(target && fileSet.has(target))),
    );
  }

  // Tarjan's strongly-connected-components algorithm. A component with more
  // than one module (or a self-edge) is a real static import cycle.
  let nextIndex = 0;
  const index = new Map<string, number>();
  const lowLink = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const cycles: string[][] = [];

  const visit = (file: string): void => {
    index.set(file, nextIndex);
    lowLink.set(file, nextIndex++);
    stack.push(file);
    onStack.add(file);

    for (const target of edges.get(file) ?? []) {
      if (!index.has(target)) {
        visit(target);
        lowLink.set(file, Math.min(lowLink.get(file)!, lowLink.get(target)!));
      } else if (onStack.has(target)) {
        lowLink.set(file, Math.min(lowLink.get(file)!, index.get(target)!));
      }
    }

    if (lowLink.get(file) !== index.get(file)) return;
    const component: string[] = [];
    let member: string;
    do {
      member = stack.pop()!;
      onStack.delete(member);
      component.push(member);
    } while (member !== file);

    if (component.length > 1 || (edges.get(file) ?? []).includes(file)) {
      cycles.push(component.map((item) => path.relative(ROOT, item).split(path.sep).join('/')));
    }
  };

  for (const file of files) if (!index.has(file)) visit(file);
  return cycles;
}

function assertNo(lines: string[], pattern: RegExp, message: string): void {
  const violations = lines.filter((line) => pattern.test(line));
  if (violations.length) throw new Error(`${message}:\n${violations.join('\n')}`);
}

export function runArchitectureBoundaryTests(): void {
  const domainFiles = listFiles(path.join(ROOT, 'domain'));
  const applicationFiles = listFiles(path.join(ROOT, 'application'));
  const presentationFiles = listFiles(path.join(ROOT, 'editor')).filter(
    (file) => !file.split(path.sep).join('/').endsWith('/editor/main.tsx'),
  );
  // main.tsx is the browser composition root and may wire infrastructure.

  const allSourceFiles = listFiles(ROOT);

  // Source data must never depend on a developer's machine. Media should be
  // selected by the user or resolved through the app's asset storage instead.
  const projectRoot = path.resolve(ROOT, '..');
  const productionFiles = listProjectTextFiles(projectRoot).filter((file) => {
    const relative = path.relative(projectRoot, file).split(path.sep).join('/');
    return !relative.startsWith('src/tests/');
  });
  assertNo(
    source(productionFiles),
    /(?:\b[A-Z]:[\\/]|file:\/\/\/[A-Z]:[\\/]|\/(?:Users|home|Volumes)\/[^/\s]+\/|\/mnt\/[a-z]\/Users\/[^/\s]+\/)/i,
    'Production source, data, and configuration must not contain machine-specific absolute paths',
  );

  // Broken relative imports must not silently disappear from architecture and
  // cycle analysis; otherwise a typo can make a forbidden edge look harmless.
  assertLocalImportsResolve(allSourceFiles);

  const domainSource = source(domainFiles);
  const applicationSource = source(applicationFiles);
  const presentationSource = source(presentationFiles);

  // Core layers and the renderer/visual-block seam should remain acyclic.
  const coreFiles = [
    ...domainFiles,
    ...applicationFiles,
    ...listFiles(path.join(ROOT, 'infrastructure')),
  ];
  const coreCycles = findImportCycles(coreFiles);
  if (coreCycles.length) {
    throw new Error(
      `Core architecture contains import cycles:\n${coreCycles.map((cycle) => cycle.join(' -> ')).join('\n')}`,
    );
  }

  const componentFiles = listFiles(path.join(ROOT, 'components'));
  const rendererSeamFiles = componentFiles.filter((file) =>
    /components\/(VisualBlock|SpeechVisualTimeline|blocks\/(BlockRenderer|BlockRendererContext))\.tsx?$/.test(
      file.split(path.sep).join('/'),
    ),
  );
  const rendererCycles = findImportCycles(rendererSeamFiles);
  if (rendererCycles.length) {
    throw new Error(
      `Renderer seam contains import cycles:\n${rendererCycles.map((cycle) => cycle.join(' -> ')).join('\n')}`,
    );
  }
  assertNo(
    source([path.join(ROOT, 'components/VisualBlock.tsx')]),
    /from\s+["']\.\/blocks\/BlockRenderer["']/,
    'VisualBlock must receive its renderer through context',
  );
  // EditorOverlay is a pointer/selection layer outside the Remotion Player.
  // It must not render VisualBlock directly or depend on the Remotion renderer
  // context; actual block visuals are rendered by the composition entry points.
  const editorOverlayPath = path.join(ROOT, 'components/EditorOverlay.tsx');
  const editorOverlaySource = source([editorOverlayPath]);
  assertNo(
    editorOverlaySource,
    /<VisualBlock\b|BlockRendererContext|from\s+["'][^"']*VisualBlock["']/,
    'EditorOverlay must remain a renderer-independent interaction layer',
  );

  const blocksSceneSource = source([path.join(ROOT, 'scenes/BlocksScene.tsx')]);
  if (!blocksSceneSource.some((line) => /<VisualBlock\b/.test(line))) {
    throw new Error('BlocksScene must continue rendering its blocks');
  }
  if (
    !blocksSceneSource.join('\n').match(/<BlockRendererContext\.Provider\s+value=\{BlockRenderer\}/)
  ) {
    throw new Error('BlocksScene must provide the block renderer for direct and nested blocks');
  }
  const speechTimelineSource = source([path.join(ROOT, 'components/SpeechVisualTimeline.tsx')]);
  if (
    !speechTimelineSource
      .join('\n')
      .match(/<BlockRendererContext\.Provider\s+value=\{BlockRenderer\}/)
  ) {
    throw new Error(
      'SpeechVisualTimeline must provide the block renderer for direct and nested blocks',
    );
  }
  const visualBlockSource = source([path.join(ROOT, 'components/VisualBlock.tsx')]);
  if (
    !visualBlockSource.join('\n').match(/if\s*\(!BlockRenderer\)/) ||
    !visualBlockSource
      .join('\n')
      .includes('VisualBlock must be rendered inside BlockRendererContext.Provider')
  ) {
    throw new Error('VisualBlock must fail loudly when the renderer provider is missing');
  }
  const rendererContextText = fs.readFileSync(
    path.join(ROOT, 'components/blocks/BlockRendererContext.ts'),
    'utf8',
  );
  if (
    !rendererContextText.includes('ComponentType<{ block: VisualBlockData }>') ||
    !rendererContextText.includes('createContext<BlockRendererComponent | null>(null)')
  ) {
    throw new Error(
      'BlockRendererContext must keep its renderer component type explicit and nullable',
    );
  }

  // Resolve actual relative import targets instead of relying only on text patterns.
  // This catches layer violations even when a source uses ../../ paths.
  assertImportDirection(domainFiles, 'domain', ['application', 'infrastructure', 'editor']);
  assertImportDirection(applicationFiles, 'application', ['infrastructure', 'editor']);
  assertImportDirection(presentationFiles, 'editor', ['infrastructure']);
  // Direct checks are easy to bypass accidentally through a shared barrel or
  // helper outside the named layer. Walk each layer's local dependency graph so
  // re-exports and intermediary modules cannot smuggle forbidden dependencies.
  assertNoTransitiveLayerDependencies(
    allSourceFiles.filter((file) => layerOf(file) === 'domain'),
    allSourceFiles,
    'domain',
    ['application', 'infrastructure', 'editor'],
  );
  assertNoTransitiveLayerDependencies(
    allSourceFiles.filter((file) => layerOf(file) === 'application'),
    allSourceFiles,
    'application',
    ['infrastructure', 'editor'],
  );
  assertNoTransitiveLayerDependencies(presentationFiles, allSourceFiles, 'editor', [
    'infrastructure',
  ]);

  // Domain is pure product policy. It cannot know the UI, browser runtime,
  // application orchestration, or infrastructure implementations.
  assertNo(
    domainSource,
    /from\s+["'](?:react|react-dom|remotion|\.\.\/)*application\/|from\s+["'](?:\.\.\/)*infrastructure\//,
    'Domain depends on an outer layer',
  );
  assertNo(
    domainSource,
    /from\s+["'](?:react|react-dom|remotion)["']|require\(["'](?:react|react-dom|remotion)["']\)/,
    'Domain imports UI/runtime dependency',
  );
  assertNo(
    domainSource,
    /\b(?:window\.|document\.|localStorage\b|indexedDB\b|IDBDatabase\b|IDBTransaction\b|Blob\b|File\b)/,
    'Domain uses a browser runtime API',
  );

  // Application owns use cases and ports. It must not instantiate concrete
  // infrastructure or depend on UI frameworks.
  assertNo(
    applicationSource,
    /from\s+["'](?:\.\.\/)*infrastructure\//,
    'Application depends on infrastructure',
  );
  assertNo(
    applicationSource,
    /from\s+["'](?:react|react-dom|remotion)["']|require\(["'](?:react|react-dom|remotion)["']\)/,
    'Application imports UI/runtime dependency',
  );
  assertNo(
    applicationSource,
    /\b(?:window\.|document\.|localStorage\b|indexedDB\b|IDBDatabase\b|IDBTransaction\b|Blob\b|File\b)/,
    'Application uses a platform-specific runtime API',
  );

  // Presentation may use browser/React APIs, but it must enter the system through Application.
  assertNo(
    presentationSource,
    /from\s+["'](?:\.\.\/)*infrastructure\//,
    'Presentation depends directly on infrastructure',
  );

  // User-facing project use cases must never resolve a project by ID alone.
  // Every read/update/delete is scoped by the authenticated/current owner.
  assertNo(
    applicationSource,
    /getProjectById\s*\(/,
    'Application exposes an unscoped project lookup',
  );
  assertNo(
    applicationSource,
    /projectStorage\.getProject\(\s*id\s*\)/,
    'Application reads a project without an owner scope',
  );

  const assetRepositorySource = source([
    path.join(ROOT, 'application', 'assets', 'assetRepository.ts'),
  ]);
  assertNo(
    assetRepositorySource,
    /\bget\(\s*assetId\s*:/,
    'AssetRepository exposes an unscoped asset lookup',
  );
  assertNo(
    assetRepositorySource,
    /\bdelete\(\s*assetId\s*:/,
    'AssetRepository exposes an unscoped asset delete',
  );
  assertNo(
    applicationSource,
    /assetRepository\.(?:get|delete)\(\s*assetId\s*\)/,
    'Application accesses an asset without a project scope',
  );

  // Browser adapters are the only place where IndexedDB is allowed.
  const infraStorageSource = source(listFiles(path.join(ROOT, 'infrastructure', 'storage')));
  assertNo(
    infraStorageSource.filter((line) => !line.includes('indexedDbProjectStorage.ts')),
    /\bindexedDB\b|\bIDBDatabase\b/,
    'IndexedDB implementation leaked outside infrastructure/storage',
  );

  // Project persistence contracts are domain-owned ports, not application types.
  const indexedDbProjectStorageSource = source([
    path.join(ROOT, 'infrastructure', 'storage', 'indexedDbProjectStorage.ts'),
  ]);
  assertNo(
    indexedDbProjectStorageSource,
    /from\s+["'][^"']*application\/project\/projectStorage["']/,
    'IndexedDB adapter depends on application project-storage contract',
  );

  // Export data contracts are independent of the browser renderer adapter.
  // Keeping these types in exportTypes avoids a runtime module cycle between
  // exportService and browserMediaExport.
  const browserExportImports = importedSpecifiers(
    path.join(ROOT, 'editor', 'export', 'browserMediaExport.ts'),
  );
  if (browserExportImports.includes('./exportService')) {
    throw new Error('Browser media export must depend on exportTypes, not exportService');
  }

  // Asset GC must operate only on the asset store. ProjectService supplies the
  // referenced IDs so this adapter does not need to inspect project records.
  const adapterText = fs.readFileSync(
    path.join(ROOT, 'infrastructure', 'storage', 'indexedDbProjectStorage.ts'),
    'utf8',
  );
  const garbageCollectionBody =
    adapterText.match(/collectGarbage\([\s\S]*?(?=\n {2}listByProject\()/)?.[0] ?? '';
  if (/PROJECTS_STORE|projectRequest/.test(garbageCollectionBody)) {
    throw new Error('Asset garbage collection depends on project storage internals');
  }
}
