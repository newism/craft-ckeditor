<?php

namespace Newism\CkEditor\web\assets\ckeditor;

use craft\helpers\App;
use craft\web\AssetBundle;
use Newism\CkEditor\Plugin;

class CKEditorAsset extends AssetBundle
{
    public $sourcePath = __DIR__ . '/src';
    public $depends = [];
    public $js = [];
    public $css = ['CKEditor.css'];

    public function init()
    {
        parent::init();
        $this->js = [
            App::parseEnv(Plugin::$plugin->settings->buildUrl),
            'CKEditor.js'
        ];
    }
}
