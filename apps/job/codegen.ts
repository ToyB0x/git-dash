import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  // NOTE: ファイルサイズが大きいため開発時はhttps経由の参照はしない
  // schema: 'https://docs.github.com/public/schema.docs.graphql',
  schema: "./schema.docs.graphql",
  // TODO: GithubGraphQLスキーマの変更を定期チェック
  // https://github.com/users/ToyB0x/projects/1/views/1?pane=issue&itemId=32240992
  documents: "src/**/*.ts",
  generates: {
    "generated/gql/": {
      preset: "client",
      config: {
        scalars: {
          DateTime: "string",
          URI: "string",
        },
      },
    },
    "generated/graphql.schema.json": {
      plugins: ["introspection"],
    },
  },
};

export default config;
