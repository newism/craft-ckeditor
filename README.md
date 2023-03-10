Note: This is an experimental plugin. Do not use this on production sites.

# CKEditor

CKEditor for CraftCMS

## Requirements

This plugin requires Craft CMS 4.4.0 or later, and PHP 8.2.0 or later.

## Installation

You can install this plugin with Composer. 

Add the repo to your composer.json folder:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/newism/craft-ckeditor.git"
        }
    ]
}
```

Open your terminal and run the following commands:

```bash
# go to the project directory
cd /path/to/my-project.test

# tell Composer to load the plugin
composer require newism/craft-ckeditor

# tell Craft to install the plugin
./craft plugin/install newism-ckeditor
```

## CKEditor Plugins

This CraftCMS plugin ships with two CKEditor Plugins:

1. Craft Link: Enables linking to CraftCMS Assets and Entries
2. Craft Image: Enables inserting images from the CraftCMS Assets modal

## Providing a CKEditor Build (easy / recommended)

To use this plugin you will need to provide a CKEditor 5 build. Note only "Classic" build has been tested at this time.

To get up and running quickly we've provided a build in the plugins `src/web/ckeditor5-custom-build/build`.

Copy the build folder to your web folder:

```shell
cp vendor/newism/craft-ckeditor/src/web/ckeditor5-custom-build/build web/ckedior5
```

### Providing a custom CKEditor Build (hard)

Note: This is not for the faint of heart.

Alternatively you can create a custom build here: https://ckeditor.com/ckeditor-5/online-builder/. Copy the custom 
build folder to the root of your project and rename it to `ckeditor5`. 

Once you've created the custom build you'll need to include the Craft CKEditor plugins and toolbar items.

#### Include the Craft CKEditor plugin in your `ckeditor5/package.json`:

```json
{
    "devDependencies": {
        "@newism/ckeditor5-craft": "file:../vendor/newism/craft-ckeditor/src/web/ckeditor5-craft-plugin"
    }
}
```

#### Add the `CraftLink` and `CraftImage` CKEditor plugins and toolbar items to your `ckeditor5/src/ckeditor.js` file:

Import the plugins

```javascript
import CraftLink from '@newism/ckeditor5-craft/src/craft-link/index.js';
import CraftImage from '@newism/ckeditor5-craft/src/craft-image/index.js';
```

Include the plugins in your `Editor.builtinPlugins` config:

```javascript
Editor.builtinPlugins = [
    CraftLink,
    CraftImage,
    // Other plugins
    // …
];
```

Add the `craftImage` button to the `Editor.defaultConfig.toolbar.items`:

```javascript
Editor.defaultConfig = {
  toolbar: {
    items: [
      "craftImage"
      // Other toolbar items
    ]
  }
};
```

#### Rebuild the custom editor

```shell
cd ckeditor5 && npm run build
```
