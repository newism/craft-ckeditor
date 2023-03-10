import {icons, Plugin} from '@ckeditor/ckeditor5-core';
import {Image} from "@ckeditor/ckeditor5-image";
import {downcastImageAttribute} from "@ckeditor/ckeditor5-image/src/image/converters";
import {ButtonView, createLabeledInputText, InputNumberView, LabelView, View} from "@ckeditor/ckeditor5-ui";

export default class CraftImage extends Plugin {

	constructor(editor) {
		super(editor);
		editor.config.define('craftImage.assetModal', {
			sources: null,
			condition: null,
			criteria: null,
			defaultSiteId: null,
			storageKey: null,
		});
	}

	static get requires() {
		return [Image];
	}

	static get pluginName() {
		return 'CraftImage';
	}

	init() {
		this._setupConversion();
		this._addComponents();
	}

	_addComponents() {

		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		// this._addImageDimensionsForm();

		componentFactory.add('craftImage', locale => {

			// The button will be an instance of ButtonView.
			const buttonView = new ButtonView(locale);

			buttonView.set({
				label: t('Insert Image'),
				icon: icons.image,
				tooltip: true,
			});

			// // Execute the command when the button is clicked (executed).
			this.listenTo(buttonView, 'execute', () => {
				const modalSettings = this.editor.config.get('craftImage.assetModal');
				Craft.createElementSelectorModal('craft\\elements\\Asset', {
					...modalSettings,
					multiSelect: true,
					onCancel: () => {
						this.editor.editing.view.focus();
					},
					onSelect: (elements) => {
						if (!elements.length) {
							return;
						}
						const source = elements.map(element => {
							return {
								src: `${element.url}#asset:${element.id}@${element.siteId}`,
								alt: element.$element.data('alt') ?? '',
								height: element.$element.data('image-height'),
								width: element.$element.data('image-width'),
								elementId: element.id
							};
						});
						this.editor.execute('insertImage', {source});
					},
					closeOtherModals: false,
				});
			});

			return buttonView;
		});
	}

	_addImageDimensionsForm() {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;
		componentFactory.add('imageDimensions', locale => {

			const widthInput = new InputNumberView(this.locale, createLabeledInputText);
			widthInput.id = 'image-dimensions-width-input';

			const widthLabel = new LabelView(this.locale);
			widthLabel.text = t('W');
			widthLabel.id = 'image-dimensions-width-label';
			widthLabel.for = 'image-dimensions-width-input';

			const widthView = new View();
			widthView.setTemplate({
				tag: 'div',
				attributes: {
					class: 'ck-reset_all-excluded'
				},
				children: [widthLabel, widthInput]
			});

			const heightLabel = new LabelView(this.locale);
			heightLabel.text = t('H');
			heightLabel.id = 'image-dimensions-height-label';
			heightLabel.for = 'image-dimensions-height-input';

			const heightInput = new InputNumberView(this.locale, createLabeledInputText);
			heightInput.id = 'image-dimensions-height-input';

			const heightView = new View();
			heightView.setTemplate({
				tag: 'div',
				attributes: {
					class: 'ck-reset_all-excluded'
				},
				children: [heightLabel, heightInput]
			});

			const containerView = new View();
			containerView.setTemplate({
				tag: 'div',
				attributes: {
					'class': 'ck-image-dimensions'
				},
				children: [widthView, heightView]
			});

			return containerView;
		});
	}

	_setupConversion() {

		const editor = this.editor;
		const schema = editor.model.schema;
		const imageUtils = editor.plugins.get('ImageUtils');

		schema.extend('imageBlock', {
			allowAttributes: ['height', 'width', 'elementId']
		});

		schema.extend('imageInline', {
			allowAttributes: ['height', 'width', 'elementId']
		});

		editor.conversion
			.for('downcast')
			.add(downcastImageAttribute(imageUtils, 'imageBlock', 'height'))
			.add(downcastImageAttribute(imageUtils, 'imageBlock', 'width'))
			.add(downcastImageAttribute(imageUtils, 'imageInline', 'height'))
			.add(downcastImageAttribute(imageUtils, 'imageInline', 'width'))
			.attributeToAttribute({
				model: 'elementId',
				view: 'data-element-id'
			})
		;

		editor.conversion.for('upcast')
			.attributeToAttribute({
				view: {
					name: 'img',
					key: 'width'
				},
				model: 'width'
			})
			.attributeToAttribute({
				view: {
					name: 'img',
					key: 'height'
				},
				model: 'height'
			})
			.attributeToAttribute({
				view: 'data-element-id',
				model: 'elementId'
			});
	}
}
