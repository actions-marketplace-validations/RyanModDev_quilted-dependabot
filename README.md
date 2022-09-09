# Quilted Dependabot

> Update certain dependencies for Quilt

Updates `gradle/libs.version.toml` for several Quilt (and Fabric) related dependencies!

- Quilt Loader
- Quilt Mappings
- QFAPI
- Mod Menu
- Cloth Config

## Use this action

```yaml
- name: Quilted Dependabot
  uses: RyanModDev/quilted-dependabot@v0
```

### Outputs

- `changelog`: a Markdown list of the updated dependencies. You can use this to
  create a PR, for instance.
