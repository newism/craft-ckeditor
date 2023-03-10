import {Plugin} from '@ckeditor/ckeditor5-core';
import {Link, LinkUI} from "@ckeditor/ckeditor5-link";
import {ButtonView, View} from "@ckeditor/ckeditor5-ui";

export default class CraftLink extends Plugin {

	constructor(editor) {
		super(editor);
		editor.config.define('craftLink', {
			assetModal: {
				sources: null,
				condition: null,
				criteria: null,
				defaultSiteId: null,
				storageKey: null,
			},
			entryModal: {
				sources: null,
				condition: null,
				criteria: null,
				defaultSiteId: null,
				storageKey: null,
			}
		});
	}

	static get requires() {
		return [Link];
	}

	static get pluginName() {
		return 'CraftLink';
	}

	init() {
		this.linkUI = this.editor.plugins.get(LinkUI);
		this._addFormViewButtons();
	}

	_addFormViewButtons() {
		const editor = this.editor;
		const t = editor.t;
		const linkUI = editor.plugins.get(LinkUI);
		const contextualBalloonPlugin = editor.plugins.get('ContextualBalloon');

		this.listenTo(contextualBalloonPlugin, 'change:visibleView', (evt, name, visibleView) => {
			if (visibleView === linkUI.formView) {
				// Detach the listener.
				this.stopListening(contextualBalloonPlugin, 'change:visibleView');

				const linkFormView = linkUI.formView;

				const linkToAssetButton = new ButtonView();
				const linkToEntryButton = new ButtonView();

				linkToAssetButton.set({
					label: t('Link to an Asset'),
					withText: true,
					_elementType: 'craft\\elements\\Asset',
					_refHandle: 'asset',
					_commandName: 'craftLinkElementCommand',
				});

				linkToAssetButton.on('execute', (evt) => {
					this._openModal({
						elementType: evt.source._elementType,
						refHandle: evt.source._refHandle
					})
				});

				linkToEntryButton.set({
					label: t('Link to an Entry'),
					withText: true,
					_elementType: 'craft\\elements\\Entry',
					_refHandle: 'entry',
					_commandName: 'craftLinkElementCommand',
				});
				linkToEntryButton.on('execute', (evt) => {
					this._openModal({
						elementType: evt.source._elementType,
						refHandle: evt.source._refHandle
					})
				});

				const dividerView = new View();
				dividerView.setTemplate({
					tag: 'div',
					attributes: {
						class: ['ck', 'ck-reset'],
						style: {
							margin: '4px',
							borderLeft: '1px solid var(--ck-color-base-border)'
						}
					}
				});

				const additionalButtonsView = new View();
				additionalButtonsView.setTemplate({
					tag: 'div',
					attributes: {
						class: ['ck', 'ck-reset'],
						style: {
							display: 'flex',
							alignItems: 'stretch',
							justifyContent: 'center',
							padding: 'var(--ck-spacing-small)',
							borderBottom: '1px solid var(--ck-color-base-border)'
						}
					},
					children: [linkToAssetButton, dividerView, linkToEntryButton]
				});

				linkFormView.template.children.unshift(additionalButtonsView);
				linkFormView.template.attributes.class.push('ck-link-form_layout-vertical');

				// Register the button under the link form view, it will handle its destruction.
				linkFormView.registerChild(additionalButtonsView);

				linkFormView.element.insertBefore(additionalButtonsView.element, linkFormView.urlInputView.element);

			}
		});

		//
		// const _createFormViewOriginal = this.linkUI._createFormView;
		//
		// this.linkUI._createFormView = () => {
		// 	const formView = _createFormViewOriginal.bind(this.linkUI).call();
		// 	const linkToAssetButton = new ButtonView();
		// 	const linkToEntryButton = new ButtonView();
		//
		// 	linkToAssetButton.set({
		// 		label: t('Link to an Asset'),
		// 		withText: true,
		// 		_elementType: 'craft\\elements\\Asset',
		// 		_refHandle: 'asset',
		// 		_commandName: 'craftLinkElementCommand',
		// 	});
		//
		// 	linkToAssetButton.on('execute', (evt) => {
		// 		this._openModal({
		// 			elementType: evt.source._elementType,
		// 			refHandle: evt.source._refHandle
		// 		})
		// 	});
		//
		// 	linkToEntryButton.set({
		// 		label: t('Link to an Entry'),
		// 		withText: true,
		// 		_elementType: 'craft\\elements\\Entry',
		// 		_refHandle: 'entry',
		// 		_commandName: 'craftLinkElementCommand',
		// 	});
		// 	linkToEntryButton.on('execute', (evt) => {
		// 		this._openModal({
		// 			elementType: evt.source._elementType,
		// 			refHandle: evt.source._refHandle
		// 		})
		// 	});
		//
		// 	const dividerView = new View();
		// 	dividerView.setTemplate({
		// 		tag: 'div',
		// 		attributes: {
		// 			class: ['ck', 'ck-reset'],
		// 			style: {
		// 				margin: '4px',
		// 				borderLeft: '1px solid var(--ck-color-base-border)'
		// 			}
		// 		}
		// 	});
		//
		// 	const additionalButtonsView = new View();
		// 	additionalButtonsView.setTemplate({
		// 		tag: 'div',
		// 		attributes: {
		// 			class: ['ck', 'ck-reset'],
		// 			style: {
		// 				display: 'flex',
		// 				alignItems: 'stretch',
		// 				justifyContent: 'center',
		// 				padding: 'var(--ck-spacing-small)',
		// 				borderBottom: '1px solid var(--ck-color-base-border)'
		// 			}
		// 		},
		// 		children: [linkToAssetButton, dividerView, linkToEntryButton]
		// 	});
		//
		// 	formView.template.children.unshift(additionalButtonsView);
		// 	formView.template.attributes.class.push('ck-link-form_layout-vertical');
		//
		// 	return formView;
		// }
	}

	_openModal(args) {
		const modalSettings = this.editor.config.get(`craftImage.${args.refHandle}Modal`);

		Craft.createElementSelectorModal(args.elementType, {
			...modalSettings,
			onCancel: () => {
				this.editor.editing.view.focus();
			},
			onSelect: (elements) => {
				if (!elements.length) {
					return;
				}
				const [element] = elements;
				const url = `${element.url}#${args.refHandle}:${element.id}@${element.siteId}`;
				this.editor.editing.view.focus();
				this.linkUI._showUI(true);
				this.linkUI.formView.urlInputView.fieldView.element.value = url;
				setTimeout(() => {
					this.linkUI.formView.urlInputView.fieldView.element.focus();
				}, 100)
			},
			closeOtherModals: false
		});
	}
}
