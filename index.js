// eslint-disable-next-line import/no-unresolved
import createCLI from "noclis";
import { mkdirp, cwd, resolve, writeFile, write, command } from "./utils.js";
import semver from "semver";
import licenses from "spdx-license-list/simple.js";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Octokit } from "octokit";
import validate from "validate-npm-package-name";
import pkgjson from "./pkgjson.js";
const licenseArray = [...licenses];

const app = createCLI(cli =>
  cli
    .config("name", "create")
    .config("version", "4.0.0")
    .config("interactiveDefault", true)
    .argument(arg =>
      arg
        .name("folder")
        .desc("Folder to put your new thing in.")
        .type("string")
        .required()
        .prompt("Where should it be?")
    )
    .option(opt =>
      opt
        .name("name")
        .desc("Name of the project")
        .type("string")
        .default(state => state.state.answers.folder)
        .config(false)
        .prompt({
          message: "What should it be called?",
          validate(name) {
            if (name === "") return "Name must not be empty";
            const result = validate(name);
            return (
              result.validForNewPackages ||
              [...result.errors, ...result.warnings].join(", ")
            );
          }
        })
    )
    .option(opt =>
      opt
        .name("scope")
        .desc("Scope of the package")
        .type("string")
        .prompt("What scope should it be in?")
    )
    .option(opt =>
      opt
        .name("description")
        .alias("desc", "describe")
        .desc("Description of the project")
        .type("string")
        .default("Project")
        .config(false)
        .prompt("How to describe it?")
    )
    .option(opt =>
      opt
        .name("license")
        .desc("License to create the project with")
        .type("string")
        .default("MIT")
        .choices(...licenses)
        .prompt({
          type: "autocomplete",
          name: "license",
          choices: licenseArray,
          limit: 6,
          initial: licenseArray.indexOf("MIT"),
          validate(value) {
            if (!licenses.has(value)) {
              return "license should be a valid license identifier";
            }
            return true;
          }
        })
    )
    .option(opt =>
      opt
        .name("github")
        .desc("If a GitHub repo should be created for the project")
        .type("boolean")
        .default(true)
        .config(false)
        .prompt("Create GitHub repo?")
    )
    .option(opt =>
      opt
        .name("git")
        .desc("If a git repo should be initialized")
        .type("boolean")
        .default(true)
        .config(false)
        .prompt("Create Git repo?")
    )
    .option(opt =>
      opt
        .name("npmInstall")
        .desc("If npm packages should be installed.")
        .type("boolean")
        .default(true)
        .config(false)
        .prompt("Install packages?")
    )
    .option(opt =>
      opt
        .name("linter")
        .alias("formatter")
        .desc("Formatter / linters to use")
        .type("string")
        .choices("eslint", "prettier")
        .array()
        .default(["eslint", "prettier"])
        .config(false)
        .prompt({
          type: "multiselect",
          message: "Formatter / Linter:",
          choices: ["eslint", "prettier"]
        })
    )
    .option(opt =>
      opt
        .name("entry")
        .desc("Entrypoint of the application")
        .type("string")
        .default("index.js")
        .config(false)
        .prompt("What is the entrypoint?")
    )
    .option(opt =>
      opt
        .name("bin")
        .desc("Binary file (leave blank if not CLI)")
        .type("string")
        .config(false)
        .prompt("What is the binary file? (Leave blank for none)")
    )
    .option(opt =>
      opt
        .name("username")
        .desc("Your GitHub username")
        .type("string")
        .default("legodude17")
        .prompt({
          message: "What is your GitHub username?",
          skip() {
            return !this.state.answers.github;
          }
        })
    )
    .option(opt =>
      opt
        .name("token")
        .desc("Your GitHub token")
        .type("string")
        .prompt({
          type: "password",
          message:
            "What is your GitHub token? (Go to https://github.com/settings/tokens/new?scopes=repo to make one)",
          skip() {
            return !this.state.answers.github;
          }
        })
    )
    .prompt(pkgjson)
);

app.on(async (args, opts) => {
  Object.assign(opts, opts.pkgjson.values);
  return [
    {
      name: "Create folder",
      key: "folder",
      handler: async () => {
        await mkdirp(args.folder);
        cwd(resolve(args.folder));
        return "Created!";
      }
    },
    {
      name: "Write package.json",
      key: "package",
      handler: () => writeFile("package.json", opts.pkgjson.result)
    },
    {
      name: "Write README.md",
      key: "readme",
      handler: () =>
        writeFile(
          "README.md",
          `# ${opts.name}
> ${opts.desc}`
        )
    },
    {
      name: "Create license file",
      key: "license",
      handler: async () => {
        const require = createRequire(import.meta.url);
        const file = require.resolve(
          "spdx-license-list/licenses/" + opts.license + ".json"
        );
        const contents = JSON.parse(
          await readFile(file, "utf8")
        ).licenseText.replace(/<([ a-z]+)>/g, (_, key) => {
          if (key === "year") return new Date().getFullYear();
          if (key === "copyright holders") return opts.author_name;
          return "";
        });
        return writeFile("LICENSE", contents);
      }
    },
    {
      name: "Create entrypoint",
      key: "entry",
      handler: async () => {
        const file = resolve(opts.entry);
        await mkdirp(dirname(file));
        return writeFile(file, "// ENTRYPOINT");
      }
    },
    opts.bin && {
      name: "Create bin",
      key: "bin",
      handler: async () => {
        const file = resolve(opts.bin);
        await mkdirp(dirname(file));
        return writeFile(file, "#! /usr/bin/env node\n\n// ENTRYPOINT");
      }
    },
    opts.linter.includes("eslint") && {
      name: "Create .eslintrc",
      key: "eslint",
      handler: () =>
        write(".eslintrc", {
          extends: [
            "plugin:n/recommended",
            "plugin:unicorn/recommended",
            "plugin:import/recommended",
            "eslint:recommended",
            opts.linter.includes("prettier") && "prettier"
          ].filter(Boolean),
          env: { node: true },
          rules: {
            "unicorn/filename-case": "off",
            "no-dupe-class-members": "off",
            "unicorn/prevent-abbreviations": "off",
            "n/no-missing-import": "off",
            "no-unused-vars": "off",
            "unicorn/import-style": "off"
          },
          parserOptions: {
            ecmaVersion: 2022,
            sourceType: "module"
          }
        })
    },
    opts.linter.includes("prettier") && {
      name: "Write .prettierrc",
      key: "prettier",
      handler: () =>
        write(".prettierrc", {
          trailingComma: "none",
          arrowParens: "avoid"
        })
    },
    opts.npmInstall && {
      name: "Install packages",
      key: "install",
      handler: () =>
        command("npm", [
          "i",
          "-D",
          "--no-audit",
          "--no-fund",
          ...(opts.linter.includes("prettier") ? ["prettier"] : []),
          ...(opts.linter.includes("eslint")
            ? [
                "eslint",
                "eslint-plugin-import",
                "eslint-plugin-n",
                "eslint-plugin-unicorn"
              ]
            : []),
          ...(opts.linter.includes("prettier") && opts.linter.includes("eslint")
            ? ["eslint-config-prettier"]
            : [])
        ])
    },
    {
      name: "Create .gitignore",
      key: "gitignore",
      handler: () =>
        writeFile(
          ".gitignore",
          ["node_modules/", "dist/"].filter(Boolean).join("\n")
        )
    },
    opts.scope && {
      name: "Create .npmrc",
      key: "npmrc",
      handler: () => writeFile(".npmrc", "access=public\n")
    },
    opts.git && {
      name: "Initalize git",
      key: "git",
      handler: () => {
        const commands = ["init", "add .", 'commit -m "init"'];
        return commands.map(c => ({
          name: "git " + c,
          key: "git" + c.split(" ")[0],
          handler: () => command("git", c)
        }));
      }
    },
    opts.github && {
      name: "Create GitHub repo",
      key: "github",
      handler: () => {
        const octokit = new Octokit({ auth: opts.token });
        return octokit.rest.repos.createForAuthenticatedUser({
          name: opts.reponame,
          description: opts.desc
        });
      }
    },
    opts.git &&
      opts.github && {
        name: "Add git origin",
        key: "origin",
        handler: () => {
          const commands = [
            `remote add origin https://github.com/${opts.username}/${opts.reponame}`,
            "push -u origin main"
          ];
          return commands.map(c => ({
            name: "git " + c,
            key: "git" + c.split(" ")[0],
            handler: () => command("git", c)
          }));
        }
      }
  ].filter(Boolean);
});

export default app;
