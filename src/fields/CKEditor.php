<?php

namespace Newism\CkEditor\fields;

use Craft;
use craft\base\conditions\ConditionInterface;
use craft\base\ElementInterface;
use craft\elements\Asset;
use craft\elements\conditions\ElementConditionInterface;
use craft\elements\Entry;
use craft\events\ElementCriteriaEvent;
use craft\helpers\App;
use craft\helpers\ArrayHelper;
use craft\helpers\Cp;
use craft\helpers\UrlHelper;
use craft\htmlfield\HtmlField;
use craft\services\ElementSources;
use Newism\CkEditor\models\Settings;
use Newism\CkEditor\Plugin;
use Newism\CkEditor\web\assets\ckeditor\CKEditorAsset;

/**
 * Ck Editor field type
 */
class CKEditor extends HtmlField
{
    public const EVENT_DEFINE_SELECTION_CRITERIA = 'defineSelectionCriteria';

    public static function displayName(): string
    {
        return Craft::t('newism-ckeditor', 'CKEditor');
    }

    public bool $purifyHtml = false;
    public string|array|null $assetSources = '*';
    public string|array|null $entrySources = '*';
    private array|null|ElementConditionInterface $_assetSelectionCondition = null;
    private array|null|ElementConditionInterface $_entrySelectionCondition = null;

    public function __construct($config = [])
    {
        if (array_key_exists('assetSources', $config) && empty($config['assetSources'])) {
            unset($config['assetSources']);
        }

        if (array_key_exists('entrySources', $config) && empty($config['entrySources'])) {
            unset($config['entrySources']);
        }

        parent::__construct($config);
    }

    public function getSettings(): array
    {
        $settings = parent::getSettings();
        $settings['assetSelectionCondition'] = $this->getAssetSelectionCondition()?->getConfig();
        $settings['entrySelectionCondition'] = $this->getEntrySelectionCondition()?->getConfig();
        return $settings;
    }

    public function getAssetSelectionCondition(): ?ElementConditionInterface
    {
        if ($this->_assetSelectionCondition !== null && !$this->_assetSelectionCondition instanceof ConditionInterface) {
            $this->_assetSelectionCondition = Craft::$app->getConditions()->createCondition($this->_assetSelectionCondition);
        }

        return $this->_assetSelectionCondition;
    }

    public function getEntrySelectionCondition(): ?ElementConditionInterface
    {
        if ($this->_entrySelectionCondition !== null && !$this->_entrySelectionCondition instanceof ConditionInterface) {
            $this->_entrySelectionCondition = Craft::$app->getConditions()->createCondition($this->_entrySelectionCondition);
        }

        return $this->_entrySelectionCondition;
    }

    public function setAssetSelectionCondition(mixed $condition): void
    {
        if ($condition instanceof ConditionInterface && !$condition->getConditionRules()) {
            $condition = null;
        }
        $this->_assetSelectionCondition = $condition;
    }

    public function setEntrySelectionCondition(mixed $condition): void
    {
        if ($condition instanceof ConditionInterface && !$condition->getConditionRules()) {
            $condition = null;
        }
        $this->_entrySelectionCondition = $condition;
    }

    protected function createSelectionCondition($elementType): ?ElementConditionInterface
    {
        $condition = $elementType::createCondition();
        $condition->queryParams = match ($elementType) {
            Asset::class => ['volume', 'volumeId', 'kind'],
            Entry::class => ['section', 'sectionId']
        };

        return $condition;
    }

    public function attributeLabels(): array
    {
        return array_merge(parent::attributeLabels(), [
            // ...
        ]);
    }

    protected function defineRules(): array
    {
        return array_merge(parent::defineRules(), [
            // ...
        ]);
    }

    public function getSettingsHtml(): ?string
    {
        return Craft::$app->getView()->renderTemplate(
            'newism-ckeditor/_components/fieldtypes/CKEditor/settings',
            $this->settingsTemplateVariables()
        );
    }

    protected function settingsTemplateVariables(): array
    {
        $assetElementType = Asset::class;

        $assetSelectionCondition = $this->getAssetSelectionCondition() ?? $this->createSelectionCondition($assetElementType);
        if ($assetSelectionCondition) {
            $assetSelectionCondition->mainTag = 'div';
            $assetSelectionCondition->id = 'asset-selection-condition';
            $assetSelectionCondition->name = 'assetSelectionCondition';
            $assetSelectionCondition->forProjectConfig = true;
            $assetSelectionCondition->queryParams[] = 'site';
            $assetSelectionCondition->queryParams[] = 'status';

            $assetSelectionConditionHtml = Cp::fieldHtml($assetSelectionCondition->getBuilderHtml(), [
                'label' => Craft::t('app', 'Selectable {type} Condition', [
                    'type' => $assetElementType::pluralDisplayName(),
                ]),
                'instructions' => Craft::t('app', 'Only allow {type} to be selected if they match the following rules:', [
                    'type' => $assetElementType::pluralLowerDisplayName(),
                ]),
            ]);
        }

        $entryElementType = Entry::class;

        $entrySelectionCondition = $this->getEntrySelectionCondition() ?? $this->createSelectionCondition($entryElementType);
        if ($entrySelectionCondition) {
            $entrySelectionCondition->mainTag = 'div';
            $entrySelectionCondition->id = 'entry-selection-condition';
            $entrySelectionCondition->name = 'entrySelectionCondition';
            $entrySelectionCondition->forProjectConfig = true;
            $entrySelectionCondition->queryParams[] = 'site';
            $entrySelectionCondition->queryParams[] = 'status';

            $entrySelectionConditionHtml = Cp::fieldHtml($entrySelectionCondition->getBuilderHtml(), [
                'label' => Craft::t('app', 'Selectable {type} Condition', [
                    'type' => $entryElementType::pluralDisplayName(),
                ]),
                'instructions' => Craft::t('app', 'Only allow {type} to be selected if they match the following rules:', [
                    'type' => $entryElementType::pluralLowerDisplayName(),
                ]),
            ]);
        }

        return [
            'field' => $this,
            'assetSourceOptions' => $this->getSourceOptionsForElement($assetElementType),
            'assetElementType' => $assetElementType::lowerDisplayName(),
            'assetPluralElementType' => $assetElementType::pluralLowerDisplayName(),
            'assetSelectionConditionHtml' => $assetSelectionConditionHtml ?? null,
            'entrySourceOptions' => $this->getSourceOptionsForElement($entryElementType),
            'entryElementType' => $entryElementType::lowerDisplayName(),
            'entryPluralElementType' => $entryElementType::pluralLowerDisplayName(),
            'entrySelectionConditionHtml' => $entrySelectionConditionHtml ?? null,
        ];
    }

    public function getSourceOptionsForElement(string $elementType): array
    {
        $options = array_map(
            fn($s) => ['label' => $s['label'], 'value' => $s['key']],
            $this->getAvailableSourceForElement($elementType)
        );
        ArrayHelper::multisort($options, 'label', SORT_ASC, SORT_NATURAL | SORT_FLAG_CASE);
        return $options;
    }

    protected function getAvailableSourceForElement($elementType): array
    {
        return ArrayHelper::where(
            Craft::$app->getElementSources()->getSources($elementType, 'modal'),
            fn($s) => $s['type'] !== ElementSources::TYPE_HEADING
        );
    }

    protected function inputHtml(mixed $value, ElementInterface $element = null): string
    {
        /** @var Settings $settings */
        $pluginSettings = Plugin::$plugin->getSettings();
        $view = Craft::$app->view;
        $view->registerJsFile(UrlHelper::url(App::parseEnv($pluginSettings->buildUrl)));
        $view->registerAssetBundle(CKEditorAsset::class);

        $id = $this->getInputId();

        $assetModalSettings = [
            'storageKey' => 'field.' . $this->id,
            'sources' => $this->assetSources,
            'condition' => $this->getAssetSelectionCondition()->getConfig(),
            'criteria' => $this->getInputSelectionCriteria(Asset::class),
            'defaultSiteId' => $element->siteId ?? null,
        ];

        $entryModalSettings = [
            'storageKey' => 'field.' . $this->id,
            'sources' => $this->entrySources,
            'condition' => $this->getEntrySelectionCondition()->getConfig(),
            'criteria' => $this->getInputSelectionCriteria(Entry::class),
            'defaultSiteId' => $element->siteId ?? null,
        ];

        $variables = [
            'id' => $id,
            'field' => $this,
            'value' => $value,
            'pluginSettings' => \Newism\CkEditor\Plugin::$plugin->getSettings(),
            'CKEditorConfig' => [
                'craftImage' => [
                    'assetModal' => $assetModalSettings
                ],
                'craftLink' => [
                    'assetModal' => $assetModalSettings,
                    'entryModal' => $entryModalSettings,
                ]
            ]
        ];

        return Craft::$app->getView()->renderTemplate(
            'newism-ckeditor/_components/fieldtypes/CKEditor/input',
            $variables
        );
    }

    public function getInputSelectionCriteria(string $elementType): array
    {
        // Fire a defineSelectionCriteria event
        $event = new ElementCriteriaEvent();
        $this->trigger(self::EVENT_DEFINE_SELECTION_CRITERIA, $event);
        $criteria = $event->criteria;

        if ($elementType === Asset::class) {
            $criteria['kind'] = ['image'];
        }

        return $criteria;
    }

    public function getElementValidationRules(): array
    {
        return [];
    }

    public function getElementConditionRuleType(): array|string|null
    {
        return null;
    }
}
