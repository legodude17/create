import semver from "semver";
import licenses from "spdx-license-list/simple.js";
import validate from "validate-npm-package-name";
export default async function pkgjson(context) {
  const fields = [
    {
      name: "name",
      validate(name) {
        if (name === "") return "Name must not be empty";
        const result = validate(name);
        return (
          result.validForNewPackages ||
          [...result.errors, ...result.warnings].join(", ")
        );
      },
      initial: context.scope
        ? `@${context.scope}/${context.name}`
        : context.name
    },
    {
      name: "reponame",
      initial: context.name,
      validate(name) {
        if (name === "") return "Name must not be empty";
        const illegal = name.replace(/[\w-]*/g, "");
        if (illegal === "") return true;
        return `Illegal character(s): ${[...new Set(illegal)].join(" ")}`;
      }
    },
    {
      name: "version",
      validate(version, state, item) {
        if (!semver.valid(version)) {
          return "version should be a valid semver value";
        }
        return true;
      },
      initial: "0.0.0"
    },
    {
      name: "description",
      initial: context.description
    },
    {
      name: "username",
      initial: context.username
    },
    {
      name: "author_name",
      message: "Author Name",
      initial: "JDB"
    },
    {
      name: "license",
      initial: context.license,
      validate(value) {
        if (!licenses.has(value)) {
          return "license should be a valid license identifier";
        }
        return true;
      }
    },
    { name: "main", initial: context.entry }
  ];
  if (context.bin) fields.push({ name: "bin", initial: context.bin });
  const template = `{
  "name": "\${name}",
  "description": "\${description}",
  "version": "\${version}",
  "main": "\${main}",${context.bin ? `\n  "bin": "\${bin}",` : ""}
  "homepage": "https://github.com/\${username}/\${reponame}",
  "author": "\${author_name} (https://github.com/\${username})",
  "repository": "\${username}/\${reponame}",
  "license": "\${license}",
  "type": "module"
}
`;
  return {
    name: "pkgjson",
    type: "snippet",
    message: "Fill out the fields in package.json:",
    fields,
    template
  };
}
