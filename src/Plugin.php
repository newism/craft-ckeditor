<?php

namespace Newism\CkEditor;

use Craft;
use craft\base\Model;
use craft\base\Plugin as BasePlugin;
use craft\events\RegisterComponentTypesEvent;
use craft\services\Fields;
use Newism\CkEditor\fields\CKEditor;
use Newism\CkEditor\models\Settings;
use yii\base\Event;

/**
 * CKEditor plugin
 *
 * @method static Plugin getInstance()
 * @method Settings getSettings()
 * @property-read Settings $settings
 */
class Plugin extends BasePlugin
{
    public static Plugin $plugin;
    public string $schemaVersion = '1.0.0';
    public bool $hasCpSettings = true;


    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Craft::$app->onInit(function () {
            $this->attachEventHandlers();
        });
    }

    protected function createSettingsModel(): ?Model
    {
        return Craft::createObject(Settings::class);
    }

    protected function settingsHtml(): ?string
    {
        return Craft::$app->view->renderTemplate('newism-ckeditor/_settings.twig', [
            'plugin' => $this,
            'settings' => $this->getSettings(),
        ]);
    }

    private function attachEventHandlers(): void
    {
        Event::on(
            Fields::class,
            Fields::EVENT_REGISTER_FIELD_TYPES,
            function (RegisterComponentTypesEvent $event) {
                $event->types[] = CKEditor::class;
            });
    }
}
