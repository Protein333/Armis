import { Arguments } from "yargs";

export type ToolGlobalOptions = {
  v?: boolean;
};

export type ToolCliArgs<T = object> = Arguments<T & ToolGlobalOptions>;

export type GlobalOptions = {
  v?: boolean;
  o?: string;
  b?: string;
  l?: string;
  f?: boolean;
  file?: string;
};

export type CliArgs<T = object> = Arguments<T & GlobalOptions>;
