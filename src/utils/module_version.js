// src/index.ts

/*******************************************************
 * 	
 * 			import.meta.env.PACKAGE_VERSION = {module/package.json}.version	
 * 	
 *******************************************************/
import packageJson from "../../module/package.json";

var envInjectionFailed = false;
var createPlugin = () => {
  return {
    name: "module-version",
    config: (_, env) => {
      if (env) {
        const key = "import.meta.env.PACKAGE_VERSION";
        const val = JSON.stringify(packageJson.version);
        return { define: { [key]: val } };
      } else {
        envInjectionFailed = true;
      }
    },
    configResolved(config) {
      if (envInjectionFailed) {
        config.logger.warn(
          `[module-version] import.meta.env.PACKAGE_VERSION was not injected due to incompatible vite version (requires vite@^2.0.0-beta.69).`
        );
      }
    }
  };
};
var src_default = createPlugin;
export {
  src_default as default
};