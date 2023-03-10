<?php

namespace Newism\CkEditor\models;

use craft\base\Model;
use craft\behaviors\EnvAttributeParserBehavior;
use craft\validators\UrlValidator;

/**
 * CKEditor settings
 */
class Settings extends Model
{
    public ?string $buildUrl = null;

    public function behaviors(): array
    {
        $behaviors = parent::behaviors();
        $behaviors['parser'] = [
            'class' => EnvAttributeParserBehavior::class,
            'attributes' => [
                'buildUrl',
            ],
        ];
        return $behaviors;
    }

    protected function defineRules(): array
    {
        return [
            ['buildUrl', UrlValidator::class, 'skipOnEmpty' => false],
        ];
    }
}
