import {Craft as CraftDll, icons} from '../src';
import Craft from '../src/craft';

import ckeditor from './../theme/icons/ckeditor.svg';

describe('CKEditor5 Craft DLL', () => {
	it('exports Craft', () => {
		expect(CraftDll).to.equal(Craft);
	});

	describe('icons', () => {
		it('exports the "ckeditor" icon', () => {
			expect(icons.ckeditor).to.equal(ckeditor);
		});
	});
});
