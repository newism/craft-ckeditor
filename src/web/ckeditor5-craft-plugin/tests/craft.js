import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Craft from '../src/craft';

/* global document */

describe('Craft', () => {
	it('should be named', () => {
		expect(Craft.pluginName).to.equal('Craft');
	});

	describe('init()', () => {
		let domElement, editor;

		beforeEach(async () => {
			domElement = document.createElement('div');
			document.body.appendChild(domElement);

			editor = await ClassicEditor.create(domElement, {
				plugins: [
					Paragraph,
					Heading,
					Essentials,
					Craft
				],
				toolbar: [
					'craftButton'
				]
			});
		});

		afterEach(() => {
			domElement.remove();
			return editor.destroy();
		});

		it('should load Craft', () => {
			const myPlugin = editor.plugins.get('Craft');

			expect(myPlugin).to.be.an.instanceof(Craft);
		});

		it('should add an icon to the toolbar', () => {
			expect(editor.ui.componentFactory.has('craftButton')).to.equal(true);
		});

		it('should add a text into the editor after clicking the icon', () => {
			const icon = editor.ui.componentFactory.create('craftButton');

			expect(editor.getData()).to.equal('');

			icon.fire('execute');

			expect(editor.getData()).to.equal('<p>Hello CKEditor 5!</p>');
		});
	});
});
