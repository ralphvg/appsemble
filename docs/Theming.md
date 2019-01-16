# Theming Apps

By default Appsemble provides a default style based on the [Bulma CSS framework](bulma). While this
is completely functional for end users, developers may be interested in further spicing up their
applications by applying their own style and branding.

To support this, Appsemble supports custom styling using a hierarchical model by allowing developers
to upload CSS which gets injected during the runtime of an application. Stylesheets can be uploaded
at **three different levels** and can be injected at **three different points** within applications.

## Hierarchy

<img src="images/theming-hierarchy.svg" style="float: right;" />

Applications can be styled at a **server** level, **organization** level as well as the
**app-specific** level.  
Within each level, styling can be further specified for **core** modules, **block** modules and
**shared** modules.

### Levels

**Server**-level styling gets applied to every application hosted on the Appsemble server. This is
useful for quickly applying style changes without having to re-deploy the server.

**Organization**-level styling gets applied to every application that belongs to a specific
organization. This is useful for applying unified styling across every application within an
organization, such as for supplying basic colour themes and icons.

**App**-level styling gets applied to one specific application. This is primarily used for any
styling that is directly related to one specific application without influencing any other
applications. App-level styling overrides any styling applied at organization and server levels.

### Modules

**Core**-module styling gets applied to any part of an Appsemble application not related to a block,
such as the navigation bar, side menu, login view, message toasts, et cetera. The styling applied to
the core modules _do not_ get applied to blocks.

**Block**-module styling gets applied to a specific block.

**Shared**-module styling gets applied to each individual block as well as the Appsemble core
modules. This is useful for applying styles to elements that can appear in both the core modules as
well as blocks, such as input fields. It can also be used to apply [CSS variables](css-variables)

## Applying themes for an application

Open the Appsemble editor on http://localhost:9999/editor. Login, and create your first app.  
Within the editor, tabs for `shared` and `core` are available. These tabs contain the current
styling for these modules. Tabs containing styling for specific blocks are automatically added and
removed depending on which blocks are used within the app recipe.

To preview a style change, simply enter CSS in the corresponding tabs and press the `Save` button.
If the styling is satisfactory, it can be uploaded to the application by pressing the `Upload`
button.

Example shared styling:

```css
.input,
.button {
  border-radius: 0;
  box-shadow: 5px 5px #888888;
  font-family: serif;
}
```

Example core styling:

```css
.navbar {
  background-color: var(--primary-color) !important;
}

.navbar-item {
  color: var(--primary-color-inverse) !important;
  padding: 0 !important;
}
```

Example block styling for `@appsemble/form`:

```css
form {
  max-width: initial !important;
  padding: 0 !important;
}

.field.is-horizontal {
  box-sizing: border-box;
  max-width: 100vw;
  padding: 0.5em 1em;
}
```

## Applying themes for an organization

Organization themes can be uploaded using the [CLI](cli).  
The command for uploading themes is as follows:

```sh
yarn appsemble theme upload [path-to-theme-css] --organization [organization-id] [--shared|--core|--block @organization/blockname]
```

More detailed information about the meaning of each parameter can be found using the following
command:

```sh
yarn appsemble theme upload --help
```

## Applying themes for server

Not yet implemented. <!-- XXX -->

[bulma]: https://bulma.io/
[cli]: ../packages/cli
[css-variables]: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables