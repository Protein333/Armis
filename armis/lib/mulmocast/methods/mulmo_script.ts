import { MulmoScript, mulmoScriptSchema } from "../types/index.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validate_1_0 = (script: any): any => {
  if (script.speechParams?.provider) {
    if (typeof script.speechParams.speakers === "object") {
      Object.keys(script.speechParams.speakers).forEach((speakerId) => {
        const speaker = script.speechParams.speakers[speakerId];
        if (!speaker.provider) {
          speaker.provider = script.speechParams.provider;
        }
      });
    }
    delete script.speechParams.provider;
  }

  return script;
};

const validators = [{ from: "1.0", to: "1.1", validator: validate_1_0 }];

export const MulmoScriptMethods = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(script: any): MulmoScript {
    const version = script.$mulmocast.version;
    // lang was optional in 1.0 and 1.1
    const defaultLang = version === "1.0" || version === "1.1" ? { lang: "en" } : {};
    const validatedScript = validators.reduce(
      (acc, validator) => {
        if (acc.$mulmocast.version === validator.from) {
          const validated = validator.validator(acc);
          validated.$mulmocast.version = validator.to;
          return validated;
        }
        return acc;
      },
      { ...defaultLang, ...script },
    );
    return mulmoScriptSchema.parse(validatedScript);
  },
};
