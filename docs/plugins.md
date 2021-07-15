# Plugin

## How to import and use a plugin

You should use
[import_maps](https://deno.land/manual@v1.11.3/linking_to_external_code/import_maps#import-maps)
for external plugins (because of peer-dependency problem).

create a `import_map.json` file in your project root that contains:

```json
{
  "imports": {
    "denzo": "https://deno.land/x/denzo@0.1.0/mod.ts"
  }
}
```

Enjoy the plugin!
