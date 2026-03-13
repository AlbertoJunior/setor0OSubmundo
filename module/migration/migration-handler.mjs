import { FoundryApi } from "../api/foundry-api.mjs";
import { SYSTEM_ID, REGISTERED_MIGRATIONS } from "../constants.mjs";
import { NotificationsUtils } from "../creators/message/notifications.mjs";
import "./migrations/index.mjs";

export class MigrationHandler {
  /**
   * Run the migration process.
   * This should only run for the GM on the 'ready' hook.
   */
  static async runMigrations() {
    const currentSystemVersion = game.system.version;
    const lastMigratedVersion = game.settings.get(SYSTEM_ID, "systemMigrationVersion");

    const hasForcedMigrations = Array.from(REGISTERED_MIGRATIONS).some(m => m.needsForceRun);

    // Check if migration is needed at all
    if (!FoundryApi.Utils.isNewerVersion(currentSystemVersion, lastMigratedVersion) && !hasForcedMigrations)
      return;

    console.log(`-> Setor 0 - O Submundo | Iniciando Migração do Sistema (${lastMigratedVersion} -> ${currentSystemVersion})`);
    NotificationsUtils.info(`Setor 0 | Executando migrações de sistema para a versão ${currentSystemVersion}. Por favor, aguarde...`, { permanent: true });

    try {
      // Pick all migrations where target version > lastMigratedVersion or are forced via instance checking
      const migrationsToRun = Array.from(REGISTERED_MIGRATIONS)
        .filter(migration => FoundryApi.Utils.isNewerVersion(migration.version, lastMigratedVersion) || migration.needsForceRun)
        .sort((a, b) => FoundryApi.Utils.isNewerVersion(a.version, b.version) ? 1 : -1);

      if (migrationsToRun.length === 0) {
        console.log(`-> Setor 0 - O Submundo | Nenhuma migração pendente encontrada.`);
        return;
      }

      let lastMigratedVersionSuccessed = lastMigratedVersion;
      let haveError = false;
      for (const migration of migrationsToRun) {
        try {
          console.log(`-> Setor 0 - O Submundo | Executando migração: ${migration.description} (${migration.version})`);
          await migration.migrate();
          lastMigratedVersionSuccessed = migration.version;
        } catch (e) {
          console.error(`-> Setor 0 - O Submundo | Erro crítico na migração:`, e);
          NotificationsUtils.error(`Setor 0 | Ocorreu um erro durante a migração. Verifique o console.`);
          haveError = true;
          break;
        }
      }

      // Update the version setting to prevent re-running
      await game.settings.set(SYSTEM_ID, "systemMigrationVersion", lastMigratedVersionSuccessed);

      if (!haveError) {
        console.log(`-> Setor 0 - O Submundo | Migração finalizada com sucesso.`);
        NotificationsUtils.info(`Setor 0 | Migrações concluídas com sucesso!`);
      } else {
        console.log(`-> Setor 0 - O Submundo | Migração finalizada com erros.`);
        NotificationsUtils.error(`Setor 0 | Ocorreu um erro durante a migração. Verifique o console.`);
      }
    } catch (e) {
      console.error(`-> Setor 0 - O Submundo | Erro crítico na migração:`, e);
      NotificationsUtils.error(`Setor 0 | Ocorreu um erro durante a migração. Verifique o console.`);
    }
  }
}
