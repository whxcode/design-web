import type { CoreApp, CoreModule } from "../types/design-core/core-api";

import { DesignCommand } from "./command";

export class DesignApp {
  readonly core: CoreApp;
  readonly command: DesignCommand;

  constructor(readonly module: CoreModule) {
    this.core = module.getApp();
    this.command = new DesignCommand(this.core.command());
  }
}
