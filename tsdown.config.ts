import { defineConfig } from 'tsdown'

const logger = console;

export default defineConfig((options) => {
  return [
    {
      entry: [
        'src/**/*.ts',
      ],
      // splitting: false, // Disable code splitting for simpler output
      sourcemap: true,
      // unbundle: true, // Note: We want to preserve module boundaries
      format: 'cjs' as const,
      clean: true,
      // treeshake: true,
      // minify: !options.watch,
      dts: false,
      external: () => true,
      platform: 'node' as const,
      fixedExtension: false,
      outExtensions: (ctx) => {
        return {
          js: '.js',
          dts: '.d.ts',
        }
      },
      inputOptions: {
        checks: {
          circularDependency: true,
          commonJsVariableInEsm: true,
          configurationFieldConflict: true,
          emptyImportMeta: true,
          eval: true,
          filenameConflict: true,
          importIsUndefined: true,
          missingGlobalName: true,
          missingNameOptionForIifeExport: true,
          preferBuiltinFeature: true,
          unresolvedEntry: true,
          unresolvedImport: true,
          cannotCallNamespace: true,
          couldNotCleanDirectory: true,
          mixedExports: true,
          pluginTimings: true,
        },
        onLog(level, log, defaultHandler) {
          if (level === 'warn') {
            if (log.code === 'CIRCULAR_DEPENDENCY' && /Circular dependency: node_modules/.test(log.message)) {
              logger.warn("Ignoring circular dependency warning from node_modules.");
              return;
            }
            throw new Error(`Build warning treated as error: ${log.message}`);
          } else {
            defaultHandler(level, log);
          }
        },
      },
    },
    {
      entry: ['./generated/prisma/**/*.ts'],
      outDir: './generated/prisma',
      sourcemap: true,
      format: 'cjs' as const,
      clean: false,
      platform: 'node' as const,
      fixedExtension: false,
      hash: false,
      outExtensions: (ctx) => {
        return {
          js: '.js',
          dts: '.d.ts',
        }
      },
    }
  ]
})
